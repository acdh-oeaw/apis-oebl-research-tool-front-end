/* eslint-disable @typescript-eslint/camelcase */
import { MeService } from '../api'

interface UserProfile {
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

  constructor() {
    this.loadUserData()
  }

  async loadUserData() {
    this.userProfile = await MeService.meRetrieve()
  }

}
