## Language
language = English

## Navigation
nav-chat = Chat
nav-friends = Friendlist
nav-notifications = Notifications
nav-settings = Settings

## Auth
auth-login-title = Login
auth-register-title = Register
auth-email = Email
auth-username = Username
auth-password = Password
auth-confirm-password = confirm password
auth-login-btn = Login
auth-register-btn = Create Account
auth-no-account = Don't have an account?
auth-has-account = Already have an account?
auth-error-password-match = Passwords do not match
auth-error-password-length = Password must be at least 8 characters long
auth-error-email-invalid = Please enter a valid email address

## Chat page
chat-no-room = Select a room to start talking
chat-no-messages = No messages yet. Say hi!
chat-input-placeholder = type a message
chat-invite-title = Invite People
chat-invite-receiver = Receiver username
chat-invite-friend-too = Also send a friend request
chat-invite-send = Send
chat-invite-username-placeholder = username
chat-room-list-title = Rooms
chat-room-list-empty = No rooms found
chat-room-list-connecting = Connecting...
chat-room-owner = by {$owner}
chat-room-global = Global room
chat-room-members = Members
chat-room-actions-leave = Leave Room
chat-room-actions-leave-confirm = Are you sure you want to leave this room?
chat-room-actions-delete = Delete Room
chat-room-actions-delete-confirm = Are you sure you want to delete this room? This cannot be undone.
chat-room-actions-ownership = Transfer Ownership
chat-room-actions-ownership-confirm = Do you really wish to transfer this room's ownership to {$user}? You might never get it back.
chat-create-title = Create room
chat-create-name = Room name
chat-create-name-placeholder = room name
chat-create-global = Global room
chat-create-submit = Create
chat-connecting = Connecting to room...
chat-connecting-failed = Could not connect. Check internet connection.

## User profile
profile-title = User profile
profile-add-friend = Add Friend
profile-remove-friend = Remove Friend
profile-remove-friend-confirm = Are you sure you want to remove this friend?
profile-request-sent = Request sent
profile-username = Username
profile-userid = User ID

## Friends page
friends-title = Your friends
friends-add-title = Add Friend
friends-send-request = Send Request
friends-list-header = Your Friends
friends-error-required = Username is required.
friends-connectiong = Loading friends...
friends-list-empty = No friends found

## Notifications page
notifications-title = Notifications
notifications-friend-requests = Friend Requests
notifications-room-invites = Room Invites
notifications-no-requests = No pending requests
notifications-no-invites = No pending invites
notifications-accept = Accept
notifications-decline = Decline
notifications-join = Join
notifications-invite-from = from: {$user}
notifications-error-friend-accept = An error occurred while accepting the request.
notifications-error-friend-decline = An error occurred while declining the request.
notifications-error-room-accept = An error occurred while accepting the invite.
notifications-error-room-decline = An error occurred while declining the invite.
notifications-connectiong = Loading notifications...
notifications-empty = No notifications found

## Settings page
settings-loading = Loading settings...
settings-title = Settings
settings-account = Account
settings-language = Language
settings-appearance = Appearance
settings-compact-layout = Use compact layout
settings-label-username = Username:
settings-label-email = Email:
settings-update-btn = Update
settings-logout-btn = Logout
settings-account-loading = Loading account details...
settings-account-update-modal-title = Update your Account
settings-account-update-subtitle = Only fill in the fields you wish to change.
settings-new-password = New Password
settings-new-password-confirm = Confirm new password
settings-upload-prompt = Upload an image
settings-upload-avatar-btn = Upload an avatar
settings-upload-avatar-title = Upload an avatar
settings-update-save = Save Changes
settings-updating = Updating...
settings-error-required = Username and Email are required.
settings-error-failed = Update failed
settings-error-upload-avatar-failed-read = Failed to read image
settings-error-upload-avatar-failed-upload = Failed to upload image

## Warning
warning-wrongversion-title = Wrong app version
warning-wrongversion-message = The backend expects version {$backendVersion} while your version of the app ({$appVersion}) supports backend version {$expectedBackendVersion}. Please update to avoid potential issues.
warning-wrongversion-dismiss = I know what I'm doing

## Shared
shared-cancel = Cancel
shared-close = Close
shared-error = An error occurred
shared-save = Save
shared-updating = Updating
shared-delete = Delete
shared-leave = Leave
shared-confirm = Confirm

## Notifications
notifications-message-title = New {$messageType} message from {$senderUsername}

## Errors (backend)
error-auth-invalid-credentials = Invalid email or password.
error-auth-missing-token = Authentication missing.
error-auth-invalid-token = Session expired or invalid.
error-user-not-found = User not found.
error-user-email-taken = Email is already in use.
error-user-username-taken = Username is already taken.
error-user-username-length = Username must be 1-35 characters long.
error-user-invalid-email = Invalid email format.
error-user-password-too-short = Password must be at least 8 characters.
error-user-empty-fields = Required fields are empty.
error-avatar-not-found = Avatar not found.
error-room-not-found = Room not found.
error-room-name-length = Room name must be 1-35 characters long.
error-room-not-member = You are not a member of this room.
error-room-already-member = This person is already a member.
error-room-owner-cannot-leave = Owner cannot leave the room without transferring ownership.
error-room-global-no-members = Cannot list members for global rooms.
error-invite-self = You cannot invite yourself.
error-invite-already-sent = Invite already sent.
error-invite-not-found = Invite not found.
error-friend-request-self = You cannot friend request yourself.
error-friend-already-exists = You are already friends.
error-friend-request-already-sent = Friend request already pending.
error-friend-request-not-found = Friend request not found.
error-friend-not-found = User is not in your friends list.
error-internal-server-error = An error occured.
error-internal-db-error = An error occured.
error-file-too-large = The file is too large (max 2MB).
error-upload-failed = Failed to upload the file.
