/**
 * @typedef {import('mic-check').MediaPermissionsError} MediaPermissionsError
 * @typedef {import('mic-check').MediaPermissionsErrorType} MediaPermissionsErrorType
 */

import { requestMediaPermissions } from 'mic-check';
import { execAsync }               from '@/utils';

export class CameraPermissions {
  /**
   * @param {MediaPermissionsError} error
   * @private
   */
  _handleUserPermissionDenied(error) {

  }

  /**
   * @param {MediaPermissionsError} error
   * @private
   */
  _handleSystemPermissionDenied(error) {

  }

  /**
   * @param {MediaPermissionsError} error
   * @private
   */
  _handleCouldNotStartVideoSource(error) {

  }

  /**
   * @param {MediaPermissionsError} error
   * @private
   */
  _handleGeneric(error) {

  }

  /**
   * @returns {Promise<any>}
   * @public
   */
  async check() {
    const result = await execAsync(requestMediaPermissions({ video: true, audio: false }));
    debugger
    if ( result.error ) {
      /**
       * @type {MediaPermissionsError}
       */
      const mediaPermissionsError = result.error;

      debugger

      switch ( mediaPermissionsError.type ) {
        case 'UserPermissionDenied':
          this._handleUserPermissionDenied(mediaPermissionsError);
          break;
        case 'SystemPermissionDenied':
          this._handleSystemPermissionDenied(mediaPermissionsError);
          break;
        case 'CouldNotStartVideoSource':
          this._handleCouldNotStartVideoSource(mediaPermissionsError);
          break;
        case 'Generic':
          this._handleGeneric(mediaPermissionsError);
          break;
        default:
          break;
      }
    }
  }
}