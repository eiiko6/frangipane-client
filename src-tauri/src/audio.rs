use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::SampleFormat;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};

pub struct AudioState {
    stream: Arc<Mutex<Option<cpal::Stream>>>,
}

impl AudioState {
    pub fn new() -> Self {
        Self {
            stream: Arc::new(Mutex::new(None)),
        }
    }
}

#[derive(Clone, serde::Serialize)]
struct MicConfig {
    sample_rate: u32,
    channels: usize,
}

#[tauri::command]
pub fn start_microphone(app: AppHandle, state: tauri::State<AudioState>) -> Result<(), String> {
    #[cfg(all(any(
        target_os = "linux",
        target_os = "dragonfly",
        target_os = "freebsd",
        target_os = "netbsd"
    )))]
    let host = cpal::host_from_id(
        cpal::available_hosts()
            .into_iter()
            .find(|id| *id == cpal::HostId::Jack)
            .expect("jack host unavailable"),
    )
    .unwrap_or(
        cpal::host_from_id(*cpal::available_hosts().first().expect("no host available"))
            .expect("host not available"),
    );

    #[cfg(any(not(any(
        target_os = "linux",
        target_os = "dragonfly",
        target_os = "freebsd",
        target_os = "netbsd"
    ))))]
    let host = cpal::default_host();

    let device = host
        .default_input_device()
        .ok_or("No input device available")?;

    let config = device
        .default_input_config()
        .map_err(|e| format!("Failed to get config: {}", e))?;

    println!("Microphone Config: {:?}", config);
    let sample_rate = config.sample_rate();
    let device_channels = config.channels() as usize;
    let channels = 1; // NOTE: temporary

    let buffer_threshold = (sample_rate as usize / 10) * 2;

    app.emit(
        "microphone-config",
        MicConfig {
            sample_rate,
            channels,
        },
    )
    .map_err(|e| e.to_string())?;

    let sample_format = config.sample_format();
    let stream_config: cpal::StreamConfig = config.into();

    let err_fn = |err| eprintln!("Stream error: {}", err);
    let app_handle = app.clone();

    let mut emit_if_full = move |buffer: &mut Vec<u8>| {
        if buffer.len() >= buffer_threshold {
            let payload = buffer.clone();
            let _ = app_handle.emit("microphone-data", payload);
            buffer.clear();
        }
    };

    let app_handle = app.clone();

    let stream = match sample_format {
        SampleFormat::F32 => {
            let mut local_buffer = Vec::with_capacity(buffer_threshold * 2);

            device.build_input_stream(
                &stream_config,
                move |data: &[f32], _| {
                    for frame in data.chunks(device_channels) {
                        let sample = frame[0]; // Take first channel
                        let s = sample.clamp(-1.0, 1.0);
                        let v = if s >= 0.0 {
                            (s * 32767.0) as i16
                        } else {
                            (s * 32768.0) as i16
                        };
                        local_buffer.extend_from_slice(&v.to_le_bytes());
                    }

                    // Only emit if we have enough data
                    if local_buffer.len() >= buffer_threshold {
                        let _ = app_handle.emit("microphone-data", &local_buffer);
                        local_buffer.clear();
                    }
                },
                err_fn,
                None,
            )
        }
        SampleFormat::I16 => {
            let mut local_buffer = Vec::with_capacity(buffer_threshold * 2);

            device.build_input_stream(
                &stream_config,
                move |data: &[i16], _| {
                    for frame in data.chunks(device_channels) {
                        let sample = frame[0];
                        local_buffer.extend_from_slice(&sample.to_le_bytes());
                    }

                    if local_buffer.len() >= buffer_threshold {
                        let _ = app_handle.emit("microphone-data", &local_buffer);
                        local_buffer.clear();
                    }
                },
                err_fn,
                None,
            )
        }
        SampleFormat::U16 => {
            let mut local_buffer = Vec::with_capacity(buffer_threshold * 2);

            device.build_input_stream(
                &stream_config,
                move |data: &[u16], _| {
                    for frame in data.chunks(device_channels) {
                        let sample = frame[0];
                        let v = (sample as i32 - 32768) as i16;
                        local_buffer.extend_from_slice(&v.to_le_bytes());
                    }

                    if local_buffer.len() >= buffer_threshold {
                        let _ = app_handle.emit("microphone-data", &local_buffer);
                        local_buffer.clear();
                    }
                },
                err_fn,
                None,
            )
        }
        _ => return Err("Unsupported sample format".to_string()),
    }
    .map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;
    *state.stream.lock().unwrap() = Some(stream);

    Ok(())
}

#[tauri::command]
pub fn stop_microphone(state: tauri::State<AudioState>) -> Result<(), String> {
    let mut stream_guard = state.stream.lock().unwrap();
    *stream_guard = None;
    Ok(())
}
