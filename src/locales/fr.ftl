## Language
language = Français

## Navigation
nav-chat = Messagerie
nav-friends = Amis
nav-notifications = Notifications
nav-settings = Compte

## Auth
auth-login-title = Connexion
auth-register-title = Inscription
auth-email = Email
auth-username = Nom d'utilisateur
auth-password = Mot de passe
auth-confirm-password = confirmer le mot de passe
auth-login-btn = Se connecter
auth-register-btn = Créer un compte
auth-no-account = Pas encore de compte ?
auth-has-account = Déjà un compte ?
auth-error-password-match = Les mots de passe ne correspondent pas
auth-error-password-length = Le mot de passe doit faire au moins 8 caractères
auth-error-email-invalid = Veuillez entrer une adresse email valide

## Chat page
chat-no-room = Sélectionnez un salon pour commencer à discuter
chat-no-messages = Pas encore de messages. Dites bonjour !
chat-input-placeholder = tapez un message
chat-invite-title = Inviter des gens
chat-room-list-empty = Aucun salon trouvé
chat-invite-receiver = Nom du destinataire
chat-invite-friend-too = Envoyer aussi une demande d'ami
chat-invite-send = Envoyer
chat-invite-username-placeholder = nom d'utilisateur
chat-room-list-title = Salons
chat-room-list-connecting = Connexion...
chat-room-owner = par {$owner}
chat-room-global = Salon global
chat-room-members = Membres
chat-room-actions-leave = Quitter le Salon
chat-room-actions-leave-confirm = Voulez-vous vraiment quitter ce salon?
chat-room-actions-delete = Supprimer le Salon
chat-room-actions-delete-confirm = Voulez-vous vraiment supprimer ce salon? C'est irréversible.
chat-room-actions-ownership = Transférer la Propriété
chat-room-actions-ownership-confirm = Voulez-vous vraiment transférer la propriété du salon à {$user}? Vous pourriez ne jamais la récupérer.
chat-create-title = Créer un salon
chat-create-name = Nom du salon
chat-create-name-placeholder = nom du salon
chat-create-global = Salon public
chat-create-submit = Créer
chat-connecting = Connexion au salon...
chat-connecting-failed = Impossible d'établir la connexion. Vérifiez votre internet.
chat-voice-select-input = Sélectionnez un périphérique d'entrée.

## User profile
profile-title = Profil d'utilisateur
profile-add-friend = Ajouter en ami
profile-remove-friend = Retirer l'ami
profile-remove-friend-confirm = Etes-vous sûr de vouloir retirer cet ami ?
profile-request-sent = Requête envoyée
profile-username = Nom d'utilisateur
profile-userid = ID d'utilisateur

## Friends page
friends-title = Vos amis
friends-add-title = Ajouter un ami
friends-send-request = Envoyer
friends-list-header = Vos Amis
friends-error-required = Le nom d'utilisateur est requis.
friends-connectiong = Chargement des amis...
friends-list-empty = Pas d'amis trouvés

## Notifications page
notifications-title = Notifications
notifications-friend-requests = Demandes d'amis
notifications-room-invites = Invitations
notifications-no-requests = Aucune demande en attente
notifications-no-invites = Aucune invitation en attente
notifications-accept = Accepter
notifications-decline = Refuser
notifications-join = Rejoindre
notifications-invite-from = de : {$user}
notifications-error-friend-accept = Erreur lors de l'acceptation de la demande.
notifications-error-friend-decline = Erreur lors du refus de la demande.
notifications-error-room-accept = Erreur lors de l'acceptation de l'invitation.
notifications-error-room-decline = Erreur lors du refus de l'invitation.
notifications-connectiong = Chargement des notifications...
notifications-empty = Pas de notifications trouvées

## Settings page
settings-loading = Chargement des paramètres...
settings-title = Paramètres
settings-account = Compte
settings-language = Langue
settings-appearance = Apparence
settings-compact-layout = Utiliser la disposition compacte
settings-label-username = Nom d'utilisateur :
settings-label-email = Email :
settings-update-btn = Modifier
settings-logout-btn = Déconnexion
settings-account-loading = Chargement du compte...
settings-account-update-modal-title = Modifier votre compte
settings-account-update-subtitle = Remplissez uniquement ce que vous souhaitez changer.
settings-new-password = Nouveau mot de passe
settings-new-password-confirm = Confirmer le mot de passe
settings-upload-prompt = Importer une image
settings-upload-avatar-btn = Importer un avatar
settings-upload-avatar-title = Importer un avatar
settings-error-required = Le nom d'utilisateur et l'email sont requis.
settings-error-failed = Échec de la mise à jour
settings-error-upload-avatar-failed-read = Erreur de lecture de l'image
settings-error-upload-avatar-failed-upload = Erreur d'envoi de l'image

## Warning
warning-wrongversion-title = Mauvaise version de l'application
warning-wrongversion-message = Le backend attend la version {$backendVersion} alors que votre version de l'application ({$appVersion}) prend en charge la version {$expectedBackendVersion} du backend. Veuillez mettre à jour pour éviter d'éventuels problèmes.
warning-wrongversion-dismiss = Je sais ce que je fais

## Shared
shared-cancel = Annuler
shared-close = Fermer
shared-error = Une erreur est survenue
shared-save = Enregistrer
shared-updating = Mise à jour...
shared-delete = Supprimer
shared-leave = Quitter
shared-confirm = Confirmer

## Notifications
notifications-message-title = Nouveau message {$messageType} de {$senderUsername}

## Errors (backend)
error-auth-invalid-credentials = Email ou mot de passe incorrect.
error-auth-missing-token = Authentification manquante.
error-auth-invalid-token = Session expirée ou invalide.
error-user-not-found = Utilisateur introuvable.
error-user-email-taken = L'adresse email est déjà utilisée.
error-user-username-taken = Ce nom d'utilisateur est déjà pris.
error-user-username-length = Le nom d'utilisateur doit faire 1-35 caractères.
error-user-invalid-email = Format d'email invalide.
error-user-password-too-short = Le mot de passe doit faire au moins 8 caractères.
error-user-empty-fields = Des champs requis sont vides.
error-avatar-not-found = Avatar introuvable.
error-room-not-found = Salon introuvable.
error-room-name-length = Le nom de la salle doit faire 1-35 caractères.
error-room-not-member = Vous n'êtes pas membre de ce salon.
error-room-already-member = Cette personne est déjà membre.
error-room-owner-cannot-leave = Le propriétaire ne peut pas quitter le salon sans transférer la propriété.
error-room-global-no-members = Impossible de lister les membres d'un salon global.
error-invite-self = Vous ne pouvez pas vous inviter vous-même.
error-invite-already-sent = Invitation déjà envoyée.
error-invite-not-found = Invitation introuvable.
error-friend-request-self = Vous ne pouvez pas vous ajouter en ami.
error-friend-already-exists = Vous êtes déjà amis.
error-friend-request-already-sent = Demande d'ami déjà en attente.
error-friend-request-not-found = Demande d'ami introuvable.
error-friend-not-found = L'utilisateur n'est pas dans votre liste d'amis.
error-internal-server-error = Une erreur est survenue.
error-internal-db-error = Une erreur est survenue.
error-file-too-large = Le fichier est trop volumineux (max 2Mo).
error-upload-failed = Erreur lors de l'envoi du fichier.
