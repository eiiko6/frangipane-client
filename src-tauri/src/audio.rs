use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Host, HostId, SampleFormat};
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

/// Helper to resolve host string to cpal::Host
fn get_host_by_name(name: &str) -> Result<Host, String> {
    let host_id = cpal::available_hosts()
        .into_iter()
        .find(|id| id.name() == name)
        .ok_or_else(|| format!("Host '{}' not found", name))?;

    cpal::host_from_id(host_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_audio_hosts() -> Vec<String> {
    cpal::available_hosts()
        .into_iter()
        .map(|id| id.name().to_string())
        .collect()
}

#[tauri::command]
pub fn get_input_devices(host_name: Option<String>) -> Result<Vec<(String, String)>, String> {
    // If no host provided, use default
    let host = if let Some(name) = host_name {
        get_host_by_name(&name)?
    } else {
        cpal::default_host()
    };

    let devices = host.input_devices().map_err(|e| e.to_string())?;

    let device_names: Vec<(String, String)> = devices
        .into_iter()
        .filter_map(|device| {
            Some((
                device.id().ok()?.to_string(),
                device.description().ok()?.to_string(),
            ))
        })
        .collect();

    Ok(device_names)
}

#[tauri::command]
pub fn start_microphone(
    app: AppHandle,
    state: tauri::State<AudioState>,
    host_name: Option<String>,
    device_id: Option<String>,
) -> Result<(), String> {
    let host = if let Some(ref h_name) = host_name {
        get_host_by_name(h_name)?
    } else {
        cpal::default_host()
    };

    let device = if let Some(ref id) = device_id {
        host.input_devices()
            .map_err(|e| e.to_string())?
            .find(|d| d.id().map(|i| i.to_string()) == Ok(id.to_string()))
            .ok_or_else(|| format!("Device '{}' not found on host '{:?}'", id, host.id()))?
    } else {
        host.default_input_device()
            .ok_or("No input device available")?
    };

    let config = device
        .default_input_config()
        .map_err(|e| format!("Failed to get config: {}", e))?;

    let sample_rate = config.sample_rate();
    let device_channels = config.channels() as usize;
    let channels = 1;

    let buffer_threshold = (sample_rate as usize / 10) * 2;

    app.emit(
        "microphone-config",
        MicConfig {
            sample_rate: sample_rate,
            channels,
        },
    )
    .map_err(|e| e.to_string())?;

    let sample_format = config.sample_format();
    let stream_config: cpal::StreamConfig = config.into();
    let err_fn = |err| eprintln!("Stream error: {}", err);
    let app_handle = app.clone();

    let stream = match sample_format {
        cpal::SampleFormat::F32 => {
            let mut local_buffer = Vec::with_capacity(buffer_threshold * 2);
            device.build_input_stream(
                &stream_config,
                move |data: &[f32], _| {
                    for frame in data.chunks(device_channels) {
                        let sample = frame[0].clamp(-1.0, 1.0);
                        let v = if sample >= 0.0 {
                            (sample * 32767.0) as i16
                        } else {
                            (sample * 32768.0) as i16
                        };
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
        cpal::SampleFormat::I16 => {
            let mut local_buffer = Vec::with_capacity(buffer_threshold * 2);
            device.build_input_stream(
                &stream_config,
                move |data: &[i16], _| {
                    for frame in data.chunks(device_channels) {
                        local_buffer.extend_from_slice(&frame[0].to_le_bytes());
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
