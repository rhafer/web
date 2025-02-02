import { createLocalVue, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex-extensions'
import Users from '../../../src/views/Users'
import Vuex from 'vuex'
import mockAxios from 'jest-mock-axios'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Users view', () => {
  describe('method "createUser"', () => {
    it('should hide the modal and show message on success', async () => {
      const wrapper = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateUserModalStub = jest.spyOn(wrapper.vm, 'toggleCreateUserModal')
      await wrapper.vm.createUser({ displayName: 'jan' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateUserModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveCreateUser: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleCreateUserModalStub = jest.spyOn(wrapper.vm, 'toggleCreateUserModal')
      await wrapper.vm.createUser({ displayName: 'jana' })

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleCreateUserModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "editUser"', () => {
    it('should show message on success', async () => {
      mockAxios.post.mockImplementationOnce(() => {
        return Promise.resolve({
          data: {
            accountUuid: '1',
            id: '1',
            roleId: '1'
          }
        })
      })
      const editUser = { id: '1', displayName: 'jan', role: { id: '1', displayName: 'admin' } }

      const wrapper = getMountedWrapper({
        mocks: {
          users: []
        }
      })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const setStub = jest.spyOn(wrapper.vm, '$set')

      await wrapper.vm.editUser(editUser)

      expect(wrapper.vm.selectedUsers[0]).toEqual(editUser)
      expect(showMessageStub).toHaveBeenCalled()
      expect(setStub).toHaveBeenCalled()
    })

    it('should show message on error', async () => {
      mockAxios.post.mockImplementationOnce(() => {
        return Promise.resolve({})
      })
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveEditUser: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.editUser({
        editUser: {}
      })

      expect(showMessageStub).toHaveBeenCalled()
    })
  })

  describe('method "deleteUsers"', () => {
    it('should hide the modal and show message on success', async () => {
      const wrapper = getMountedWrapper()
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteUserModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteUserModal')
      await wrapper.vm.deleteUsers([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteUserModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = getMountedWrapper({ resolveDeleteUser: false })
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      const toggleDeleteUserModalStub = jest.spyOn(wrapper.vm, 'toggleDeleteUserModal')
      await wrapper.vm.deleteUsers([{ id: '1' }])

      expect(showMessageStub).toHaveBeenCalled()
      expect(toggleDeleteUserModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('computed method "availableSideBarPanels"', () => {
    it('should contain EditPanel with property enabled set true when one user is selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [{ id: '1' }] } })
      expect(
        wrapper.vm.availableSideBarPanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeTruthy()
    })
    it('should contain EditPanel with property enabled set false when no user is selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [] } })
      expect(
        wrapper.vm.availableSideBarPanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
    it('should contain EditPanel with property enabled set false when multiple users are selected', () => {
      const wrapper = getMountedWrapper({ data: { selectedUsers: [{ id: '1' }, { id: '2' }] } })
      expect(
        wrapper.vm.availableSideBarPanels.find((panel) => panel.app === 'EditPanel').enabled
      ).toBeFalsy()
    })
  })

  describe('computed method "allUsersSelected"', () => {
    it('should be true if every user is selected', () => {
      const wrapper = getMountedWrapper({
        mocks: { users: [{ id: '1' }] },
        data: { selectedUsers: [{ id: '1' }] }
      })
      expect(wrapper.vm.allUsersSelected).toBeTruthy()
    })
    it('should false if not every user is selected', () => {
      const wrapper = getMountedWrapper({
        mocks: { users: [{ id: '1' }, { id: '2' }] },
        data: { selectedUsers: [{ id: '1' }] }
      })
      expect(wrapper.vm.allUsersSelected).toBeFalsy()
    })
  })

  describe('method toggleSideBar', () => {
    it('should set sideBarOpen to true if current value is false', () => {
      const wrapper = getMountedWrapper({})
      wrapper.vm.sideBarOpen = false
      wrapper.vm.toggleSideBar()
      expect(wrapper.vm.sideBarOpen).toBeTruthy()
    })
    it('should set sideBarOpen to false if current value is true', () => {
      const wrapper = getMountedWrapper({})
      wrapper.vm.sideBarOpen = true
      wrapper.vm.toggleSideBar()
      expect(wrapper.vm.sideBarOpen).toBeFalsy()
    })
  })
})

function getMountedWrapper({
  data = {},
  mocks = {},
  resolveCreateUser = true,
  resolveEditUser = true,
  resolveDeleteUser = true
} = {}) {
  return shallowMount(Users, {
    localVue,
    store: createStore(Vuex.Store, {
      actions: {
        showMessage: jest.fn()
      },
      getters: {
        getToken: () => 'token'
      }
    }),
    mocks: {
      $gettext: jest.fn(),
      $ngettext: jest.fn(),
      $gettextInterpolate: jest.fn(),
      loadResourcesTask: {
        isRunning: false,
        perform: jest.fn()
      },
      graphClient: {
        users: {
          createUser: () => (resolveCreateUser ? Promise.resolve() : Promise.reject(new Error(''))),
          editUser: () => (resolveEditUser ? Promise.resolve() : Promise.reject(new Error(''))),
          deleteUser: () => (resolveDeleteUser ? Promise.resolve() : Promise.reject(new Error('')))
        }
      },
      users: [
        {
          id: '1'
        }
      ],
      roles: [],
      userAssignments: [],
      ...mocks
    },
    data: () => {
      return {
        selectedUsers: [
          {
            id: 1
          }
        ],
        ...data
      }
    },
    stubs: {
      'create-user-modal': true,
      'delete-user-modal': true,
      'app-loading-spinner': true,
      'no-content-message': true,
      'oc-breadcrumb': true,
      'oc-button': true,
      'oc-icon': true,
      translate: true
    },
    directives: {
      'oc-tooltip': jest.fn()
    }
  })
}
