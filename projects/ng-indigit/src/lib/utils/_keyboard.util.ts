export const KEYBOARD_UTIL: {
  isNonCharacterKey: (event: KeyboardEvent) => boolean;
  isNumberKey: (event: KeyboardEvent) => boolean;
} = {

  isNonCharacterKey: event => {
    if (event.altKey || event.ctrlKey || event.shiftKey)
      return true;
    switch (event.key) {
      // Control keys
      case 'Tab':
      case 'Enter':
      case 'Insert':
      // Lock toggles
      case 'CapsLock':
      case 'NumLock':
      case 'ScrollLock':
      // Navigation
      case 'PageUp':
      case 'PageDown':
      case 'Home':
      case 'End':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      // Functional
      case 'F1':
      case 'F2':
      case 'F3':
      case 'F4':
      case 'F5':
      case 'F6':
      case 'F7':
      case 'F8':
      case 'F9':
      case 'F10':
      case 'F11':
      case 'F12':
      case 'F21':
      // Miscellaneous
      case 'Meta':
      case 'Pause':
      case 'ContextMenu':
      case 'AudioVolumeMute':
      case 'AudioVolumeUp':
      case 'AudioVolumeDown':
      case 'MediaPlayPause':
      case 'LaunchApplication2':
        return true;
    }
    return false;
  },

  isNumberKey: event => {
    return /[\u0660-\u0669\u06f0-\u06f9\d]/.test(event.key);
  },

};
