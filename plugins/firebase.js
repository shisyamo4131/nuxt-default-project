/**
 * firebase.js
 * (c) 2023 shisyamo4131
 *
 * Initialize firebase app and export instances of firebase services.
 * API keys should be configured in '.env.xxx.js' files.
 *
 * ex.)
 * .env.local.js for local using Firebase Emulators.
 * .env.dev.js for development using Firebase Project.
 * .env.prod.js for production using Firebase Project.
 *
 * Learn more about publicRuntimeConfig.
 * https://nuxtjs.org/docs/directory-structure/nuxt-config#runtimeconfig
 *
 * ----------------------------------------------------------------------------
 *  HOW TO USE
 * ----------------------------------------------------------------------------
 * 1. Install cross-env to your project.
 *    npm i cross-env
 *
 * 2. Create '.env.local.js', '.env.dev.js' and '.env.prod.js' at root directory.
 *    Configure API keys in each file. show below.
 *    [.env.dev.js]
 *    -------------------------------------------------------------------------
 *    module.exports = {
 *      apiKey: 'XXXXX',
 *      authDomain: 'XXXXX',
 *      databaseURL: 'XXXXX',
 *      projectId: 'XXXXX',
 *      storageBucket: 'XXXXX',
 *      messagingSenderId: 'XXXXX',
 *      appId: 'XXXXX',
 *      vapidKey: 'XXXXX',
 *    }
 *    -------------------------------------------------------------------------
 *
 * 3. Edit package.json's scripts.
 *    ex.)
 *    "dev": "cross-env NUXT_HOST=0.0.0.0 NUXT_PORT=3000 NODE_ENV=\"dev\" nuxt",
 *
 * 4. Add 'publicRuntimeConfig' to nuxt.config.js
 */

import { initializeApp } from 'firebase/app'
import {
  connectFirestoreEmulator,
  getFirestore,
  // initializeFirestore,
} from 'firebase/firestore'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

export default (context, inject) => {
  const firebaseConfig = {
    apiKey: context.$config.apiKey,
    authDomain: context.$config.authDomain,
    databaseURL: context.$config.databaseURL,
    projectId: context.$config.projectId,
    storageBucket: context.$config.storageBucket,
    messagingSenderId: context.$config.messagingSenderId,
    appId: context.$config.appId,
  }

  /* Initialize firebase. */
  const firebaseApp = initializeApp(firebaseConfig)
  const inAuth = getAuth(firebaseApp)
  const inFunctions = getFunctions(firebaseApp)
  // //////////////////////////////////////////////////////////////////////////
  //
  // NOTE Emulator環境でFirestoreからのデータ取得（onSnapshot）を行うと
  //      以下のエラーメッセージが表示される「こと」があった。
  //
  //      Firestore (X.X.X): Could not reach Cloud Firestore backend.
  //      Backend didn't respond within 10 seconds.
  //
  //      このエラーが表示されるのは毎回ではなく、ネットで調べても原因が分からない。
  //      また、
  //
  //      WebChannelConnection RPC 'Listen' stream 0x1076aac3 transport errored
  //
  //      という警告が表示されるケースも見受けられた。
  //      どちらの場合もonSnapshotからのレスポンスにかなりの時間がかかる。
  //      long pollingを有効にすることで回避できるという情報があったため
  //      試してみたところ、エラーや警告を回避できないものの、体感的に
  //      onSnapshotのレスポンスがかなり改善されたような気がする。
  //      根本的な原因の究明と解決が出来ていないことに注意。
  //      https://github.com/firebase/firebase-js-sdk/issues/6993
  //      https://github.com/firebase/firebase-js-sdk/issues/2923
  //
  //      2023-10-11  onSnapshotもgetDocsも結果は変わらず。
  //                  試しにlimitで取得件数を1件にしてみたところ、正常に動作。
  //                  30件だと再発。Emulator使用時は件数が多くなると発生する模様。
  const inFirestore = getFirestore(firebaseApp)
  // const inFirestore = initializeFirestore(firebaseApp, {
  //   experimentalForceLongPolling: true,
  // })

  // //////////////////////////////////////////////////////////////////////////
  const inDatabase = getDatabase(firebaseApp)
  const inStorage = getStorage(firebaseApp)
  const inVapidKey = context.$config.vapidKey

  /* Connect to emulators if environment is 'local'. */
  if (process.env.NODE_ENV === 'local') {
    // eslint-disable-next-line
    console.log('[firebase.js] firebase is using emulators!')
    connectAuthEmulator(inAuth, 'http://localhost:9099')
    connectFunctionsEmulator(inFunctions, 'localhost', 5001)
    connectFirestoreEmulator(inFirestore, 'localhost', 8080)
    connectDatabaseEmulator(inDatabase, 'localhost', 9000)
    connectStorageEmulator(inStorage, 'localhost', 9199)
  }

  /* inject */
  inject('firebase', firebaseApp)
  inject('auth', inAuth)
  inject('functions', inFunctions)
  inject('firestore', inFirestore)
  inject('database', inDatabase)
  inject('storage', inStorage)
  inject('vapidKey', inVapidKey)
}
