import { Injectable, inject } from '@angular/core';

/**
 * Simple logger service that proxies to the browser console.
 * In a real app you could swap this out for a remote logger.
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  /** Log informational messages */
  info(message?: any, ...optionalParams: any[]): void {
    console.info(message, ...optionalParams);
  }

  /** Log warnings */
  warn(message?: any, ...optionalParams: any[]): void {
    console.warn(message, ...optionalParams);
  }

  /** Log errors */
  error(message?: any, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams);
  }
}
