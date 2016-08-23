import { Map, Set, fromJS } from 'immutable'
import altspace from 'altspace'
import { saveUser } from './store/sync'
import { getStore } from './store/store'

export const AREAS = [
  'delivering-value',
  'fun',
  'health-of-codebase',
  'easy-to-release',
  'learning',
  'mission',
  'pawns-or-players',
  'speed',
  'suitable-process',
  'support',
  'teamwork'
]
export const AREA_NAMES = {
  'delivering-value': 'Delivering Value',
  'fun': 'Fun',
  'health-of-codebase': 'Health of Codebase',
  'easy-to-release': 'Easy to release',
  'learning': 'Learning',
  'mission': 'Mission',
  'pawns-or-players': 'Pawns or Players',
  'speed': 'Speed',
  'suitable-process': 'Suitable Process',
  'support': 'Support',
  'teamwork': 'Teamwork'
}
export const COLORS = ['green', 'yellow', 'red']

export const INITIAL_STATE = Map({
  currentArea: AREAS[0],
  areas: Map({}),
  users: Map({}),
  selectedColor: null
})

/* {
  currentArea: 'delivering-value',
  areas: {
    'delivering-value': {
      'altspace-1234': 'green',
      'anon-5678': 'yellow'
    }
  },
  users: {
    'altspace-1234': {
      name: 'Casper',
      tableAngle: 35
    },
    'anon-5678': {
      name: 'Anonymous 5678',
      tableAngle: 210
    }
  }
} */

export function setFullStateFromSnapshot(state, snapshot) {
  return state.merge(fromJS(snapshot))
}

export function setResponse(state, color, playerId) {
  let currentArea = state.get('currentArea')
  return state.setIn(['areas', currentArea, playerId], color)
}

export function getCurrentArea() {
  let store = getStore()
  let state = store.getState()
  return state.get('currentArea')
}

export function getNextArea() {
  let area = getCurrentArea()
  let index = AREAS.indexOf(area)
  index++
  if (index >= AREAS.length) {
    index = 0
  }
  return AREAS[index]
}

export function setArea(state, area) {
  if (!area) {
    area = AREAS[0] // Always default to first area
  }
  return state.set('currentArea', area)
}

export function setUser(state, playerId, name, tableAngle) {
  return state.setIn(['users', playerId], { name, tableAngle })
}

let playerInfo
export function getPlayerInfo() {
  return new Promise(function(resolve, reject) {
    if (playerInfo) {
      resolve(playerInfo)
    }

    if(altspace.inClient) {
      altspace.getUser().then(function(userInfo)
      {
        playerInfo = {
          id: 'altspace-' + userInfo.userId,
          name: userInfo.displayName
        }
        resolve(playerInfo)
      })
    }
    else {
      let playerId = 'anon-' + Math.floor(Math.random() * 10000)
      playerInfo = {
        id: playerId,
        name: playerId
      }
      resolve(playerInfo)
    }
  })
}

export function getMySelectedColor(state) {
  let currentArea = state.get('currentArea')
  return state.getIn(['areas', currentArea, playerInfo.id])
}

export function getOtherUsers(state) {
  let currentArea = state.get('currentArea')

  let allUsers = state.get('users')
  let otherUsers = allUsers.filterNot(keyIn(playerInfo.id))

  let userData = otherUsers.map((userAttributes, userId) => {
    return {
      name: userAttributes.name,
      tableAngle: userAttributes.tableAngle || 0,
      color: state.getIn(['areas', currentArea, userId])
    }
  })

  return userData
}

function keyIn(/*...keys*/) {
  var keySet = Set(arguments);
  return function (v, k) {
    return keySet.has(k);
  }
}