import config from './config';
import 'dotenv/config';

export default {
    ...config,
    frontend_url: process.env.FRONTEND_URL || config.frontend_url,
    redirect_url: process.env.REDIRECT_URL || ''
}