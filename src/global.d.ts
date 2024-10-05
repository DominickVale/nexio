import App from './app.ts'
import { CONFIG } from './config'

declare global {
  interface Window {
    app: InstanceType<typeof App>
    NEXIO_CONFIG: typeof CONFIG
  }
}

export {}
