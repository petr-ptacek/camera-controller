/**
 * @typedef {import('@/typings').MediaPermissionHandlersMap} MediaPermissionHandlersMap
 * @typedef {import('mic-check').MediaPermissionsError} MediaPermissionsError
 * @typedef {import('mic-check').MediaPermissionsErrorType} MediaPermissionsErrorType
 */

import { requestMediaPermissions } from 'mic-check';
import { execAsync }               from '@/utils';

/**
 * @param {MediaPermissionsError} error
 * @param {MediaPermissionHandlersMap} handlers
 */
function handleUserPermissionDenied(error, handlers) {
  handlers.onUserPermissionDenied?.(error);
}


/**
 * @param {MediaPermissionsError} error
 * @param {MediaPermissionHandlersMap} handlers
 */
function handleSystemPermissionDenied(error, handlers) {
  switch ( error.name ) {
    case 'NotFoundError':
      handlers.onDeviceNotFound?.(error);
      break;
    default:
      handlers.onSystemPermissionDenied?.(error);
  }
}

/**
 * @param {MediaPermissionsError} error
 * @param {MediaPermissionHandlersMap} handlers
 */
function handleCouldNotStartVideoSource(error, handlers) {
  handlers.onTrackError?.(error);
}


/**
 * @param {MediaPermissionsError} error
 * @param {MediaPermissionHandlersMap} handlers
 */
function handleGeneric(error, handlers) {
  switch ( error.name ) {
    case 'NotFoundError':
      handlers.onDeviceNotFound?.(error);
      break;
    default:
      handlers.onError?.(error);
      break;
  }
}

export class MediaChecker {

  /**
   * @returns {boolean}
   * @static
   */
  static isSupportedApi() {
    return (
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices &&
      'enumerateDevices' in navigator.mediaDevices
    );
  }

  /**
   * @param {MediaPermissionHandlersMap} handlers
   * @returns {Promise<boolean>}
   * @public
   */
  static async checkVideoPermissions(handlers) {
    if ( !MediaChecker.isSupportedApi() ) {
      handlers.onCameraApiNotSupported?.();
      return false;
    }

    const result = await execAsync(requestMediaPermissions({ video: true, audio: false }));

    if ( result.error ) {
      /**
       * @type {MediaPermissionsError}
       */
      const mediaPermissionsError = result.error;

      switch ( mediaPermissionsError.type ) {
        case 'UserPermissionDenied':
          handleUserPermissionDenied(mediaPermissionsError, handlers);
          break;
        case 'SystemPermissionDenied':
          handleSystemPermissionDenied(mediaPermissionsError, handlers);
          break;
        case 'CouldNotStartVideoSource':
          handleCouldNotStartVideoSource(mediaPermissionsError, handlers);
          break;
        case 'Generic':
          handleGeneric(mediaPermissionsError, handlers);
          break;
        default:
          handleGeneric(mediaPermissionsError, handlers);
          break;
      }
    }

    return result.data;
  }
}