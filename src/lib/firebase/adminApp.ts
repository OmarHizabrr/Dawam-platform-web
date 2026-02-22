import * as admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: "dawam-platform-web",
                clientEmail: "firebase-adminsdk-fbsvc@dawam-platform-web.iam.gserviceaccount.com",
                privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCvPCCwhHJh3YOR\nS2nXk8cMi0DtnTVXItQJgfK/+r/QYITIrbjIhS4zkZtKuwoxIN7EjR1W6gIx36k0\nrjldaaZBZyGGOPJQRtKStUE0X8UBo54ceCcRtx/MhGE/qIC9yUdfJDViFKgR8zaH\nJoByeXMyFcLG11KKXmXJWq89roeVR+Wc0gT5OpJjpQZerRztUpRxkcquoZZHgoX9\nbKqUG+LlAw8+hw19KLPxzi+Dof6oseonKque7YhP8Yt1YxCZf61YHO17KP+EcjIC\nYr3dwlx7e7S6M0EoAMjr0xRYjAFea/3cM72+fFHVuKNMo4tAMqYkYceGZ3J5Fkn8\ne1Zl5hWfAgMBAAECggEALpqBoSBgYTmt03boe75gCiyAxJDyTi3DkZG/UyJnYA5D\nUjGtepq82lcnozzSLZWt2T0kZ+iNU+FFWW7ab8b4wd0hM9ayTvo+52iQIlM0DEcM\n9kpYLaRzrwsn5+uy7YZ51kpFbkPLHRb/UftB3vAA3HmgFwzN9WG8lUvqXi+r/F20\n+Nq6ODrg4h1kkZTeMeh6H4mSdvY5FR+jS4OteuZNNQLJBxS7Jt3Eiv0zsQY39cwi\ndflmsA4iIb8P4QFd6LpyzoFUyZBG0gXoFO52fQzC4HwwbPLh7nNe/8VfZ1eF++eT\nEGR77h88s4WFjkdDp9mBZRcz7CVttViBi+FZ7BdS2QKBgQDpaX5w5tWNRc08PCsb\ncYXqAYv82Sai4p2S2UfHEkM6BdxiKY4MdR9onxN8FLpTUJSFSDrLRT/EW008aGdK\nBTO3UF1kteo0UJmdV+Zs07QmWabJlFFUfVD1beoQDSspmWfdPpl1KFqOvimvFaYl\nXxRyhRjm6GET1qAhRafm0IFbdwKBgQDAMVzcJw8O7ZbyprwzsIiFgywwv31urY0l\nzAZ/9bxel1fDEGiIL8KvKqo2Fa+CzkidwyC309T+YL2iznvJuJecGRAhAq7kboFq\ Lx2CI+UZ/oG4nN7obKfyaE5yoCgx3YHPlXcHOXUFqvJWYh2d0sQD7B9GMU0SPVkW\nE7wXtSjRGQKBgDVTqdSnmHCvWuWBJaQeeqbs9YuuHRqnxbJwO+rqbDuMbT5sGg0U\ nkTl45p25qpwwU85jozMfviLhbTL482hA6gDetoe03C5Zn88H7xg8AfOlFesGHNK9\n0spP82L5bzwQ1V8B11OiBZaJMcLTomL1ZxmG+RqASvWaWnlfja25Q2SfAoGAV5Hm\ UrVFSjL9VUCdfhvQiKz05J1LpLNVHcSxrXolQyBIL6v5RRwl47RX697DoqElOyTe\ncoQFh4ZCwby9cHM4OTq+O5xCXfjv5JblJhf+2nI5XwmzE0n22B+optfMmLPp4tCi\ndFs8s8FpO+zmu7N99p+OvGfYSxhC0ClbyZ2UpHkCgYAm4flFvhQ3UuzzXAGFXuCH\nz48mJqa+sMX0C/tAfSQNdAK+k7mlDHuCryXPgR/0Ta3HBT6H8sU7JdCss2FTExRv\ np6RXnI/Zdv1Sj0vOGXC3xx4O21WOXVkz4MoiD52nuqb9pgKosyo9i8i1IBQYKw5L\nX6xpVVBVtjVPKgpRytFNnw==\n-----END PRIVATE KEY-----\n",
            }),
        });
    } catch (error) {
        console.error("Firebase admin initialization error", error);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
