
export type WithId<T> = Omit<T, 'id'> & {
  id: number
}

export type Modify<T, R> = Omit<T, keyof R> & R
