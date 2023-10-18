/**
 * Copyright 2023 shisyamo4131. All Rights reserved.
 *
 * Base class that provides Create, Read, Update, and Delete functions
 * for Firestore.
 * Use Nuxt's Injection to load a class that extends this class.
 * The hasMany field can be defined to be undeletable if there is
 * dependent data with the defined conditions.
 *
 * { collection, field, condition }
 *
 * Firestore query condition expressions can be used for condition.
 *
 * tokenFields specifies the fields held by the class itself.
 * To store vulnerable Firestore queries, a token map is generated with
 * the strings stored in the specified fields.
 *
 * The ability to delete dependent documents will not be implemented.
 * Use Cloud Functions as it must be atomic.
 *
 * The Autonumbers collection allows for automatic numbering.
 * To perform Autonumbers,
 * 1. specify the collection name in the document ID,
 * 2. 'current' as the current value
 * 3. 'length' as the number of digits
 * 4. 'field' as the field to be numbered
 * 5. define the condition in the field to mean validation.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore'

export default class FireModel {
  #firestore
  #collection
  #auth
  #hasMany = []
  #tokenFields = []

  /**
   * CONSTRUCTOR
   * @param {*} firestore firestoreインスタンス
   * @param {string} collection 管理対象のコレクション名です。
   * @param {*} auth authインスタンス
   */
  constructor(firestore, collection, auth) {
    this.#firestore = firestore
    if (!collection) {
      this.sendConsole({
        message: 'A collection is required at FireModel constructor.',
        type: 'error',
      })
    }
    this.#collection = collection
    this.#auth = auth
    this.initialize()
    Object.defineProperties(this, {
      tokenMap: {
        // enumerable: true,
        enumerable: !!this.#tokenFields.length,
        get() {
          if (!this.#tokenFields.length) return null
          const arr = []
          this.#tokenFields.forEach((fieldName) => {
            if (fieldName in this) {
              const target = this[fieldName].replace(/\s+/g, '')
              for (let i = 0; i <= target.length - 1; i++) {
                arr.push([target.substring(i, i + 1).toLowerCase(), true])
              }
              for (let i = 0; i <= target.length - 2; i++) {
                arr.push([target.substring(i, i + 2).toLowerCase(), true])
              }
            }
          })
          const result = Object.fromEntries(arr)
          return result
        },
        set(v) {},
      },
    })
  }

  get tokenFields() {
    return this.#tokenFields
  }

  set tokenFields(v) {
    this.#tokenFields = v
  }

  get hasMany() {
    return this.#hasMany
  }

  set hasMany(v) {
    this.#hasMany = v
  }

  get collection() {
    return this.#collection
  }

  set collection(v) {
    this.#collection = v
  }

  get firestore() {
    return this.#firestore
  }

  get auth() {
    return this.#auth
  }

  /**
   * Firestoreはクエリに貧弱なため、N-gramを利用した検索を実装するのが有効です。
   * 引数で受け取った文字列をmapに変換して返します。
   * @param {string} value tokenMapとして生成する文字列です。
   * @returns
   */
  getNgramTokenMap(value) {
    const arr = []
    const target = value.replace(/\s+/g, '')
    for (let i = 0; i <= target.length - 1; i++) {
      arr.push([target.substring(i, i + 1).toLowerCase(), true])
    }
    for (let i = 0; i <= target.length - 2; i++) {
      arr.push([target.substring(i, i + 2).toLowerCase(), true])
    }
    return Object.fromEntries(arr)
  }

  /**
   * データモデルを初期化するためのメソッドです。
   * コンストラクタから呼び出されるほか、独自に呼び出すことで
   * データモデルを初期化することができます。
   * @param {object} item
   * @returns
   */
  initialize(item) {
    this.docId = item?.docId || ''
    this.createAt = item?.createAt || null
    this.createDate = item?.createDate || ''
    this.updateAt = item?.updateAt || null
    this.updateDate = item?.updateDate || ''
    this.uid = item?.uid || ''
    if (!item) return
    Object.keys(item).forEach((key) => {
      if (key in this) {
        this[key] = JSON.parse(JSON.stringify(item[key]))
      }
    })
  }

  /**
   * ドキュメントの作成前に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  beforeCreate() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの更新前に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  beforeUpdate() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの削除前に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  beforeDelete() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの作成後に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  afterCreate() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの更新後に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  afterUpdate() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * ドキュメントの削除後に実行されます。
   * 継承先での上書きを前提としており、Promiseを返す必要があります。
   * @returns A promise.
   */
  afterDelete() {
    return new Promise((resolve) => {
      resolve()
    })
  }

  /**
   * UTCでのDateオブジェクトを返します。
   * @returns A Date object as UTC.
   */
  get dateUtc() {
    const offset = new Date().getTimezoneOffset()
    return new Date(new Date().getTime() + offset * 60 * 1000)
  }

  /**
   * JSTでのDateオブジェクトを返します。
   * @returns A Date object as JST.
   */
  get dateJst() {
    const offset = new Date().getTimezoneOffset()
    return new Date(new Date().getTime() + (offset + 9 * 60) * 60 * 1000)
  }

  /**
   * モデルのプロパティに設定された値をドキュメントとしてコレクション追加します。
   * @param {string} docId 追加するドキュメントのidです。指定しない場合、自動で割り振られます。
   * @returns プロミスで解決されたドキュメントへの参照が返されます。
   */
  async create(docId = undefined) {
    this.sendConsole({
      message: docId
        ? 'create() is called. Document id is %s.'
        : 'create() is called. No document id is specified.',
      params: docId ? [docId] : [],
    })
    try {
      await this.beforeCreate().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at beforeCreate() in create().',
          type: 'error',
        })
        throw err
      })
      const colRef = collection(this.#firestore, this.#collection)
      const docRef = docId ? doc(colRef, docId) : doc(colRef)
      this.docId = docRef.id
      this.createAt = this.dateUtc.getTime()
      this.createDate = this.dateJst.toLocaleString()
      this.updateAt = this.dateUtc.getTime()
      this.updateDate = this.dateJst.toLocaleString()
      this.uid = this.#auth?.currentUser?.uid || 'unknown'
      const { ...item } = this
      await runTransaction(this.#firestore, async (transaction) => {
        const autonumRef = doc(
          this.#firestore,
          `Autonumbers/${this.#collection}`
        )
        const autonumDoc = await transaction.get(autonumRef)
        if (autonumDoc.exists() && autonumDoc.data().condition) {
          const num = autonumDoc.data().current + 1
          const length = autonumDoc.data().length
          const newCode = (Array(length).join('0') + num).slice(-length)
          const maxCode = Array(length + 1).join('0')
          if (newCode === maxCode) {
            throw new Error(
              `No more documents can be added to the ${
                this.#collection
              } collection.`
            )
          }
          item[autonumDoc.data().field] = newCode
          transaction.update(autonumRef, { current: num })
        }
        transaction.set(docRef, item)
      }).catch((err) => {
        this.sendConsole({
          message: 'An error has occured at setDoc() in create().',
          type: 'error',
        })
        throw err
      })
      await this.afterCreate().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at afterCreate() in create().',
          type: 'error',
        })
        throw err
      })
      this.sendConsole({
        message:
          'A document was successfully created in the %s collection with document id %s.',
        params: [this.#collection, docRef.id],
      })
      return docRef
    } catch (err) {
      this.sendConsole({ message: err.message, type: 'error' })
      throw err
    }
  }

  /**
   * 指定されたドキュメントidに該当するドキュメントをコレクションから取得し、
   * 自身のプロパティに値をセットします。
   * @param {string} docId 取得するドキュメントのidです。
   * @returns
   */
  async fetch(docId = undefined) {
    this.sendConsole({ message: 'fetch() is called.' })
    try {
      if (!docId) throw new Error('fetch() requires docId as argument.')
      const colRef = collection(this.#firestore, this.#collection)
      const docRef = doc(colRef, docId)
      const docSnap = await getDoc(docRef).catch((err) => {
        this.sendConsole({
          message: 'An error has occured at getDoc() in fetch().',
          type: 'error',
        })
        throw err
      })
      if (docSnap.exists()) {
        this.sendConsole({
          message:
            'The document corresponding to the specified document id (%s) has been fetched.',
          params: [docId],
        })
        Object.keys(this).forEach((key) => {
          if (key in docSnap.data()) this[key] = docSnap.data()[key]
        })
      } else {
        this.sendConsole({
          message:
            'The document corresponding to the specified document id (%s) does not exist. FireModel properties are initialized.',
          params: [docId],
          type: 'warn',
        })
        this.initialize()
      }
    } catch (err) {
      this.sendConsole({ message: err.message, type: 'error' })
      throw err
    }
  }

  /**
   * モデルのプロパティにセットされた値で、ドキュメントを更新します。
   * 更新対象のドキュメントはdocIdプロパティを参照して特定されます。
   * @returns
   */
  async update() {
    this.sendConsole({ message: 'update() is called.' })
    try {
      if (!this.docId) {
        throw new Error(
          'update() should have docId as a property. Call fetch() first.'
        )
      }
      await this.beforeUpdate().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at beforeUpdate() in update().',
          type: 'error',
        })
        throw err
      })
      const colRef = collection(this.#firestore, this.#collection)
      const docRef = doc(colRef, this.docId)
      this.updateAt = this.dateUtc.getTime()
      this.updateDate = this.dateJst.toLocaleString()
      this.uid = this.#auth?.currentUser?.uid || 'unknown'
      const { createAt, createDate, ...item } = this
      await updateDoc(docRef, item).catch((err) => {
        this.sendConsole({
          message: 'An error has occured at update().',
          type: 'error',
        })
        throw err
      })
      await this.afterUpdate().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at afterUpdate() in update().',
          type: 'error',
        })
        throw err
      })
      this.sendConsole({
        message:
          'A document was successfully updated in the %s collection with document id %s.',
        params: [this.#collection, docRef.id],
      })
      return docRef
    } catch (err) {
      this.sendConsole({ message: err.message, type: 'error' })
      throw err
    }
  }

  /**
   * モデルのプロパティにセットされた値で、ドキュメントを更新します。
   * 更新対象のドキュメントはdocIdプロパティを参照して特定されます。
   * @returns
   */
  async delete() {
    this.sendConsole({ message: 'delete() is called.' })
    try {
      if (!this.docId) {
        throw new Error(
          'delete() should have docId as a property. Call fetch() first.'
        )
      }
      const hasChild = await this.#hasChild()
      if (hasChild) {
        throw new Error(
          '関連する情報が登録されているため削除できません。\nCollection: ' +
            hasChild.collection +
            '\ndocId: ' +
            this.docId
        )
      }
      await this.beforeDelete().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at beforeDelete() in delete().',
          type: 'error',
        })
        throw err
      })
      const colRef = collection(this.#firestore, this.#collection)
      const docRef = doc(colRef, this.docId)
      await deleteDoc(docRef).catch((err) => {
        this.sendConsole({
          message: 'An error has occured at delete().',
          type: 'error',
        })
        throw err
      })
      await this.afterDelete().catch((err) => {
        this.sendConsole({
          message: 'An error has occured at afterDelete() in delete().',
          type: 'error',
        })
        throw err
      })
      this.sendConsole({
        message:
          'A document was successfully deleted in the %s collection with document id %s.',
        params: [this.#collection, docRef.id],
      })
    } catch (err) {
      this.sendConsole({ message: err.message, type: 'error' })
      throw err
    }
  }

  /**
   * hasManyプロパティに定義されたリレーションにもとづく子ドキュメントが
   * 存在するかどうかを返します。
   * @returns 子ドキュメントが存在すればtrueを、存在しなければfalseを返します。
   */
  async #hasChild() {
    for (const item of this.#hasMany) {
      const colRef = collection(this.#firestore, item.collection)
      const whrObj = where(item.field, item.condition, this.docId)
      const q = query(colRef, whrObj, limit(1))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) return item
    }
    return false
  }

  /**
   * コンソールを出力します。
   * @param {message, params, type}
   */
  sendConsole({ message, params = [], type = 'info' }) {
    // eslint-disable-next-line
    console[type](`[FireModel] ${message}`, ...params)
  }
}
