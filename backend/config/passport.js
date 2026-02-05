const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const { 
    findUserByGoogleId, createUserFromGoogle, 
    findUserByDiscordId, createUserFromDiscord,
    findUserByGithubId, createUserFromGithub
} = require('../models/User');


passport.use(
    new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
    },
    async (req, _, __, profile, done) => {
        try {
            const db = req.app.locals.db;
            let user = await findUserByGoogleId(db, profile.id);
            // 2. Si l'utilisateur n'existe pas, le créer
            if (!user) {
                user = await createUserFromGoogle(db, {
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    picture: profile.photos[0].value,
                });
            }
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }
    )
)

passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            passReqToCallback: true
        },
        async (req, _, __, profile, done) => {
        try {
            const db = req.app.locals.db; // Accès à MongoDB
            let user = await findUserByDiscordId(db, profile.id);
            if (!user) {
                user = await createUserFromDiscord(db, {
                    discordId: profile.id,
                    email: profile.email ? profile.email : "Aucun Email",
                    name: profile.username,
                    picture: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp?size=2048` : "Aucun Avatar",
                });
            }
            done(null, user);
        } catch (error) {
            done(error, null);
        }
        }
    )
)


passport.use(
    new GithubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
            passReqToCallback: true,
        },
        async (req, _, __, profile, done) => {
        try {
            const db = req.app.locals.db; 
            let user = await findUserByGithubId(db, profile.id);
            if (!user) {
                user = await createUserFromGithub(db, {
                githubId: profile.id,
                email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : "Aucun Email",
                name: profile.username || profile.displayName,
                picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
                });
            }
            done(null, user);
        } catch (error) {
            done(error, null);
        }
        }
    )
)


// ⚠️ PAS de serializeUser/deserializeUser car on utilise JWT (stateless)
// Ces fonctions sont uniquement pour les sessions

module.exports = passport;
