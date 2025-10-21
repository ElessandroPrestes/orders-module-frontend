<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@auth/stores/useAuthStore'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const route = useRoute()

const username = computed(() => auth.user?.name || 'Usuário')
const userInitial = computed(() => (auth.user?.name ? auth.user.name[0].toUpperCase() : '?'))

const leftDrawerOpen = ref(false)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function confirmLogout() {
  $q.dialog({
    title: 'Sair',
    message: 'Tem certeza que deseja sair?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await auth.logout()
    router.push({ name: 'login' }) 
  })
}

// Detecta antena atual pela rota
const serial = computed(() => route.params.serial_number || null)

// Links públicos
const publicLinks = [
  {
    title: 'Início',
    caption: 'Página principal',
    icon: 'home',
    to: '/'
  },
  {
    title: 'Listar Antenas',
    caption: 'Visualizar todas',
    icon: 'satellite_alt',
    to: '/app/antennas/list'
  }
]

// Links privados (sempre visíveis para logado)
const privateLinks = [
  {
    title: 'Nova Antena',
    caption: 'Cadastrar',
    icon: 'add_circle',
    to: '/app/antennas/create'
  }
]

// Links contextuais (detalhes e edição da antena atual)
const contextualLinks = computed(() => {
  if (!auth.isLoggedIn || !serial.value) return []

  return [
    {
      title: 'Detalhes da Antena',
      caption: `SN-${serial.value}`,
      icon: 'visibility',
      to: `/app/antennas/details/${serial.value}`
    },
    {
      title: 'Editar Antena',
      caption: `SN-${serial.value}`,
      icon: 'edit',
      to: `/app/antennas/edit/${serial.value}`
    }
  ]
})

// Monta os links finais
const linksToShow = computed(() => {
  if (auth.isLoggedIn) {
    return [...publicLinks, ...privateLinks, ...contextualLinks.value]
  }

  return [...publicLinks, {
    title: 'Login',
    caption: 'Acessar o sistema',
    icon: 'login',
    to: '/app/login'
  }]
})
</script>



<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Meu App
        </q-toolbar-title>

        <q-space />

        <div v-if="auth.isLoggedIn" class="row items-center q-gutter-sm q-mr-md">
          <q-avatar size="32px" color="primary" text-color="white">
            {{ userInitial }}
          </q-avatar>
          <span>{{ username }}</span>
        </div>

        <q-btn
          v-if="auth.isLoggedIn"
          flat
          label="Sair"
          icon="logout"
          @click="confirmLogout"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list padding>
        <q-item-label header>Navegação</q-item-label>

        <q-item
          v-for="link in linksToShow"
          :key="link.title"
          :to="link.to"
          clickable
          v-ripple
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon 
              :name="link.icon" 
              :class="link.title === 'Início' ? 'text-primary' : ''" 
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
            <q-item-label caption>{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

