import { Editor, IssueLemma, LemmaStatus } from './types/issue'
import mockIssues from './mock-issues'

export const issueStatus: LemmaStatus[] = [
  {
    id: 1,
    name: 'verteilt'
  },
  {
    id: 2,
    name: 'ausgeschrieben',
  },
  {
    id: 3,
    name: 'zugesagt',
  },
  {
    id: 4,
    name: 'eingelangt',
  },
  {
    id: 5,
    name: 'autordurchsicht',
  },
  {
    id: 6,
    name: 'gruppenredaktion',
  },
  {
    id: 7,
    name: 'endredaktion',
  }
]

export const editors: Editor[] = [
  {
    userId: '1',
    name: 'Philipp',
    role: {
      name: 'editor',
      id: '1'
    },
    email: 'Philipp@gmail.com',
    profilePicture: 'https://picsum.photos/50/50'
  }
]

export const issueLemma: IssueLemma[] = mockIssues as any[]
// [
//   {
//     id: '1',
//     lemma: {
//       firstName: 'Gustav Johann',
//       lastName: 'Scheibel',
//       description: 'Erste Geige Wiener Philharmoniker',
//       dateOfBirth: '',
//       dateOfDeath: '',
//     },
//     editor: {
//       userId: '2',
//       name: 'Johannes',
//       role: {
//         name: 'editor',
//         id: '1'
//       },
//       email: 'Philipp@gmail.com',
//       profilePicture: 'https://picsum.photos/50/50'
//     },
//     author: {
//       userId: '2',
//       name: 'Maurice Ernst',
//       role: {
//         name: 'author',
//         id: '2'
//       },
//       email: ''
//     },
//     characterCount: 0,
//     entityCount: 0,
//     labels: [],
//     status: {
//       name: 'ausgeschrieben',
//       id: '1',
//       order: 2
//     },
//     tokenCount: 51,
//     notes: [
//       {
//         id: '3',
//         user: {
//           name: 'Arnold Graf',
//           userId: '3',
//           role: {
//             id: '1',
//             name: 'editor'
//           },
//           email: 'arnold.graf@gmail.com'
//         },
//         date: '2012-08-02',
//         text: 'Cillum quis deserunt esse esse ipsum proident eiusmod ut aute laborum id. Ut minim esse amet ex proident laborum. Quis eiusmod duis incididunt nostrud qui mollit duis dolor tempor.'
//       }
//     ]
//   },
//   {
//     id: '2',
//     lemma: {
//       firstName: 'Claudio',
//       lastName: 'Abbado',
//       description: 'Ständiger Gastdirigent der Wiener Philharmoniker',
//       dateOfDeath: '',
//       dateOfBirth: '',
//     },
//     editor: {
//       userId: '1',
//       name: 'Philipp',
//       role: {
//         name: 'editor',
//         id: '1'
//       },
//       email: 'Philipp@gmail.com',
//       profilePicture: 'https://picsum.photos/50/50'
//     },
//     status: {
//       order: 0,
//       name: 'verteilt',
//       id: '1'
//     },
//     tokenCount: 50,
//     author: {
//       userId: '5',
//       name: 'Peter Horazdovsky',
//       role: {
//         name: 'author',
//         id: '3'
//       },
//       email: ''
//     },
//     characterCount: 0,
//     entityCount: 0,
//     labels: [
//       {
//         name: 'vorläufige Zusage',
//         id: '1',
//         color: 'orange'
//       }
//     ],
//     notes: [
//       {
//         id: '1',
//         user: {
//           name: 'Arnold Graf',
//           userId: '1',
//           role: {
//             id: '4',
//             name: 'author'
//           },
//           email: 'asd'
//         },
//         date: '2012-08-02',
//         text: 'Cillum quis deserunt esse esse ipsum proident eiusmod ut aute laborum id. Ut minim esse amet ex proident laborum. Quis eiusmod duis incididunt nostrud qui mollit duis dolor tempor.'
//       }
//     ]
//   }
// ]

export const labels = [
  {
    name: 'vorläufige Zusage',
    id: '1',
    color: 'orange'
  },
  {
    name: 'prioritär',
    id: '2',
    color: 'red'
  },
  {
    name: 'Vertrag eingelangt',
    id: '3',
    color: 'cornflowerblue'
  },
  {
    name: 'Vertrag geschickt',
    id: '4',
    color: 'rebeccapurple'
  }
]
