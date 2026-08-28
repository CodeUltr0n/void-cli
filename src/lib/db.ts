// Database connection legacy wrapper - redirected to in-memory store for Vercel deployment
import * as store from './store'
export { store }
export const db = {}
