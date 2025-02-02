import App from '../../src/App.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GetTextPlugin from 'vue-gettext'

const localVue = createLocalVue()

localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
localVue.use(Vuex)

const componentStubs = {
  ErrorScreen: true,
  LoadingScreen: true
}

const $route = {
  query: {
    'public-token': 'a-token',
    app: 'exampleApp',
    fileId: '2147491323'
  },
  params: {
    filePath: 'someFile.md'
  }
}

const mockFileInfo = jest.fn(() => ({
  name: $route.params.filePath,
  fileInfo: {
    '{http://owncloud.org/ns}fileid': '2147491323'
  }
}))

const storeOptions = {
  getters: {
    getToken: jest.fn(() => 'GFwHKXdsMgoFwt'),
    configuration: jest.fn(() => ({
      server: 'http://example.com/',
      currentTheme: {
        general: {
          name: 'some-company'
        }
      }
    })),
    userReady: () => true,
    capabilities: jest.fn(() => ({
      files: {
        app_providers: [
          {
            apps_url: '/app/list',
            enabled: true,
            open_url: '/app/open'
          }
        ]
      }
    }))
  },
  modules: {
    External: {
      namespaced: true,
      getters: {
        mimeTypes: jest.fn()
      },
      actions: {
        fetchMimeTypes: jest.fn()
      },
      mutations: {
        SET_MIME_TYPES: jest.fn()
      }
    }
  }
}

const appUrl = 'https://example.test/d12ab86/loe009157-MzBw'

const providerSuccessResponsePost = {
  app_url: appUrl,
  method: 'POST',
  form_parameters: {
    access_token: 'asdfsadfsadf',
    access_token_ttl: '123456'
  }
}

const providerSuccessResponseGet = {
  app_url: appUrl,
  method: 'GET'
}

describe('The app provider extension', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should show a loading spinner while loading', async () => {
    const makeRequest = jest.fn(() =>
      setTimeout(() => {
        Promise.resolve({
          ok: true,
          status: 200
        })
      }, 500)
    )
    const wrapper = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
  it('should show a meaningful message if an error occurs during loading', async () => {
    const makeRequest = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        message: 'We encountered an internal error'
      })
    )
    const wrapper = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
  it('should fail for unauthenticated users', async () => {
    const makeRequest = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 401,
        message: 'Login Required'
      })
    )
    const wrapper = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
  it('should be able to load an iFrame via get', async () => {
    const makeRequest = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => providerSuccessResponseGet
      })
    )

    const wrapper = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
  it('should be able to load an iFrame via post', async () => {
    const makeRequest = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => providerSuccessResponsePost
      })
    )
    const wrapper = createShallowMountWrapper(makeRequest)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper).toMatchSnapshot()
  })
})

function createShallowMountWrapper(makeRequest, options = {}) {
  return shallowMount(App, {
    localVue,
    store: createStore(),
    stubs: componentStubs,
    mocks: {
      $route
    },
    computed: {
      currentFileContext: () => $route.params
    },
    methods: {
      getFileInfo: mockFileInfo,
      makeRequest
    },
    ...options
  })
}

function createStore() {
  return new Vuex.Store(storeOptions)
}
