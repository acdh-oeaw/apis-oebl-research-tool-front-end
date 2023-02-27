/* eslint-disable @typescript-eslint/camelcase */
import { MeService } from '../api'

export interface UserProfile {
  email: string
  first_name: string
  last_name: string
  role: string
  userId: number
}

export default class UserStore {

  public userProfile: UserProfile = {
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    userId: -1
  }

  hasLoaded = false

  constructor() {
    this.loadUserData()
  }

  async loadUserData() {
    this.userProfile = await MeService.meRetrieve()
    this.hasLoaded = true
  }

  getFullName() {
    if (this.userProfile.first_name !== '' && this.userProfile.first_name !== '') {
      return `${this.userProfile.first_name} ${this.userProfile.last_name}` 
    }
    else return `User ${this.userProfile.userId}`
  }

}
