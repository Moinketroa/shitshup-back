import process from 'process';

export const config = () => ({
    oAuth2: {
        googleClientId: process.env.GOOGLE_CLIENT_ID || '',
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        googleRedirectURL: process.env.GOOGLE_REDIRECT_URL || '',
    },
});
