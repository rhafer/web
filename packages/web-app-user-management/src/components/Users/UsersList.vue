<template>
  <oc-table
    ref="table"
    :sort-by="sortBy"
    :sort-dir="sortDir"
    :fields="fields"
    :data="data"
    :highlighted="highlighted"
    @sort="handleSort"
  >
    <template #selectHeader>
      <oc-checkbox
        size="large"
        class="oc-ml-s"
        :label="$gettext('Select all users')"
        :value="allUsersSelected"
        hide-label
        @input="$emit('toggleSelectAllUsers')"
      />
    </template>
    <template #select="{ item }">
      <oc-checkbox
        class="oc-ml-s"
        size="large"
        :value="selectedUsers"
        :option="item"
        :label="getSelectUserLabel(item)"
        hide-label
        @input="$emit('toggleSelectUser', item)"
      />
    </template>
    <template #avatar="{ item }">
      <avatar-image :width="32" :userid="item.id" :user-name="item.displayName" />
    </template>
    <template #role="{ item }"> {{ item.role.displayName }} </template>
    <template #actions="{ item }">
      <oc-button v-oc-tooltip="$gettext('Details')" @click="$emit('clickDetails', item)">
        <oc-icon size="small" name="information" />
      </oc-button>
      <oc-button v-oc-tooltip="$gettext('Edit')" class="oc-ml-s" @click="$emit('clickEdit', item)">
        <oc-icon size="small" name="pencil" />
      </oc-button>
    </template>
    <template #footer>
      <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
        <p class="oc-text-muted">{{ footerText }}</p>
      </div>
    </template>
  </oc-table>
</template>

<script>
import { onBeforeUnmount, ref } from '@vue/composition-api'
import { Registry } from '../../services'
import Fuse from 'fuse.js'
import Mark from 'mark.js'

export default {
  name: 'UsersList',
  props: {
    users: {
      type: Array,
      required: true
    },
    selectedUsers: {
      type: Array,
      required: true
    }
  },
  setup() {
    const searchTerm = ref('')
    const token = Registry.search.subscribe('updateTerm', ({ term }) => (searchTerm.value = term))
    onBeforeUnmount(() => Registry.search.unsubscribe('updateTerm', token))

    return {
      searchTerm
    }
  },
  data() {
    return {
      sortBy: 'onPremisesSamAccountName',
      sortDir: 'asc',
      markInstance: null
    }
  },
  computed: {
    allUsersSelected() {
      return this.users.length === this.selectedUsers.length
    },
    footerText() {
      const translated = this.$gettext('%{userCount} users in total')
      return this.$gettextInterpolate(translated, { userCount: this.users.length })
    },
    fields() {
      return [
        {
          name: 'select',
          title: '',
          type: 'slot',
          width: 'shrink',
          headerType: 'slot'
        },
        {
          name: 'avatar',
          title: '',
          type: 'slot',
          width: 'shrink'
        },
        {
          name: 'onPremisesSamAccountName',
          title: this.$gettext('User name'),
          sortable: true
        },
        {
          name: 'displayName',
          title: this.$gettext('First and last name'),
          sortable: true
        },
        {
          name: 'mail',
          title: this.$gettext('Email'),
          sortable: true
        },
        {
          name: 'role',
          title: this.$gettext('Role'),
          type: 'slot',
          sortable: true
        },
        {
          name: 'actions',
          title: this.$gettext('Actions'),
          sortable: false,
          type: 'slot',
          alignH: 'right'
        }
      ]
    },
    data() {
      const orderedUsers = this.orderBy(this.users, this.sortBy, this.sortDir === 'desc')
      return this.filter(orderedUsers, this.searchTerm)
    },
    highlighted() {
      return this.selectedUsers.map((user) => user.id)
    }
  },
  watch: {
    searchTerm() {
      if (!this.markInstance) {
        return
      }
      this.markInstance.unmark()
      this.markInstance.mark(this.searchTerm, {
        element: 'span',
        className: 'highlight-mark',
        exclude: ['th *', 'tfoot *']
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.markInstance = new Mark(this.$refs.table.$el)
    })
  },
  methods: {
    filter(users, searchTerm) {
      if (!(searchTerm || '').trim()) {
        return users
      }
      const usersSearchEngine = new Fuse(users, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: ['displayName', 'mail', 'onPremisesSamAccountName', 'role.displayName']
      })

      return usersSearchEngine.search(searchTerm).map((r) => r.item)
    },
    orderBy(list, prop, desc) {
      return [...list].sort((user1, user2) => {
        let a, b

        if (prop === 'role') {
          a = user1.role?.displayName || ''
          b = user2.role?.displayName || ''
        } else {
          a = user1[prop] || ''
          b = user2[prop] || ''
        }

        return desc ? b.localeCompare(a) : a.localeCompare(b)
      })
    },
    handleSort(event) {
      this.sortBy = event.sortBy
      this.sortDir = event.sortDir
    },
    getSelectUserLabel(user) {
      const translated = this.$gettext('Select %{ user }')

      return this.$gettextInterpolate(translated, { user: user.displayName }, true)
    }
  }
}
</script>

<style lang="scss">
.highlight-mark {
  background: yellow;
  color: var(--oc-color-text-muted);
}
</style>
