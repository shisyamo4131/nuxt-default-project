/**
 * ### マスタデータ用Vuex
 *
 * #### ACTIONS
 * ##### subscribe
 * 各種マスタデータのリアルタイムリスナーをセットします。
 * 全てのマスタデータへのリスナーがセットされるとpromiseを返します。
 * ###### NOTE
 * onSnapshotによる読み込みの前にコンポーネントからの参照が発生するとエラーになる。
 * Read件数が倍増してしまうが、一旦、getDocsで全件を読み込み、その後にリスナーをセットする。
 *
 * ##### unsubscribe
 * 各種マスタデータのリアルタイムリスナーを解除し、Vuexで管理している
 * マスタデータを初期化します。
 * 処理がすべて終わるとpromiseを返します。
 *
 * @author shisyamo4131
 */
import { collection, getDocs, onSnapshot } from 'firebase/firestore'

/******************************************************************
 * STATE
 ******************************************************************/
export const state = () => ({
  // Customers: [],
  listeners: {
    // Customers: null,
  },
})
/******************************************************************
 * GETTERS
 ******************************************************************/
export const getters = {
  // Customer: (state) => (payload) => {
  //   return state.Customers.find(({ docId }) => docId === payload)
  // },
}
/******************************************************************
 * MUTATIONS
 ******************************************************************/
export const mutations = {
  addMaster(state, { collection, data }) {
    if (!collection || !data) return
    const items = state[collection]
    const index = items.findIndex(({ docId }) => docId === data.docId)
    if (index === -1) items.push(data)
    if (index !== -1) items.splice(index, 1, data)
  },
  removeMaster(state, { collection, data }) {
    if (!collection || !data) return
    const items = state[collection]
    const index = items.findIndex(({ docId }) => docId === data.docId)
    if (index !== -1) items.splice(index, 1)
  },
  addListener(state, { collection, listener }) {
    /* eslint-disable */
    if (!collection || !listener) {
      console.error(
        `[Vuex] Parameter 'collection' and 'listeners' must be specified.`
      )
      return
    }
    if (!(collection in state.listeners)) {
      console.error(`[Vuex] The ${collection} collection does not exist.`)
      return
    }
    state.listeners[collection] = listener
    /* eslint-enable */
  },
  removeListener(state, collection) {
    /* eslint-disable */
    if (!collection) {
      console.error(`[Vuex] Parameter 'collection' must be specified.`)
      return
    }
    if (!(collection in state.listeners)) {
      console.error(`[Vuex] The ${collection} collection does not exist.`)
      return
    }
    if (state.listeners[collection]) {
      state.listeners[collection]()
    }
    Object.keys(state.listeners).forEach((key) => {
      state[key].splice(0)
    })
    /* eslint-enable */
  },
}
/******************************************************************
 * ACTIONS
 ******************************************************************/
export const actions = {
  async subscribe({ state, commit }) {
    try {
      const promises = []
      Object.keys(state.listeners).forEach((key) => {
        const colRef = collection(this.$firestore, key)
        promises.push(getDocs(colRef))
      })
      const snapshots = await Promise.all(promises)
      Object.keys(state.listeners).forEach((key, index) => {
        snapshots[index].docs.forEach((doc) => {
          commit('addMaster', { collection: key, data: doc.data() })
        })
      })
      Object.keys(state.listeners).forEach((key) => {
        const colRef = collection(this.$firestore, key)
        const listener = onSnapshot(colRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added')
              commit('addMaster', {
                collection: key,
                data: change.doc.data(),
              })
            if (change.type === 'modified')
              commit('addMaster', {
                collection: key,
                data: change.doc.data(),
              })
            if (change.type === 'removed')
              commit('removeMaster', {
                collection: key,
                data: change.doc.data(),
              })
          })
        })
        commit('addListener', { collection: key, listener })
      })
    } catch (err) {
      // eslint-disable-next-line
      console.error(err)
      alert(err.message)
    }
  },
  unsubscribe({ state, commit }) {
    return new Promise((resolve, reject) => {
      try {
        Object.keys(state.listeners).forEach((key) => {
          commit('removeListener', key)
        })
        resolve()
      } catch (err) {
        // eslint-disable-next-line
        console.error(err)
        alert(err.message)
        reject(err)
      }
    })
  },
}
