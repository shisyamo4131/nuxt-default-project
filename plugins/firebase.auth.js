/**
 * ### firebase.auth
 * onAuthStateChangedを利用してユーザーの認証状態を監視します。
 * 認証されていればユーザー情報をVuexに格納し、マスタデータの購読を開始します。
 * 認証されていなければVuexのユーザー情報を初期化し、マスタデータの購読を解除します。
 * 既に認証されているユーザーがサイトにアクセスした際、ユーザー情報が
 * Vuexに格納される前にmiddlewareが実行されてしまことを避けるため、
 * Promiseでラップしています。
 * @author shisyamo4131
 */
import { onAuthStateChanged } from 'firebase/auth'

export default (context) => {
  return new Promise((resolve) => {
    const auth = context.app.$auth
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult()
        context.store.commit('auth/setUser', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isEmailVerified: user.emailVerified,
          roles: idTokenResult.claims.roles || [],
        })
        await context.store.dispatch('masters/subscribe')
      } else {
        context.store.commit('auth/setUser', null)
        await context.store.dispatch('masters/unsubscribe')
      }
      resolve()
    })
  })
}
