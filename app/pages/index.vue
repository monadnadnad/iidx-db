<template>
  <main class="min-h-screen p-10">
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold">
        テスト
      </h1>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem
            v-for="item in [{ title: '曲一覧', to: '/songs' }, { title: 'ログイン', to: '/login' }]"
            :key="item.to"
          >
            <NuxtLink
              v-slot="{ isActive, href, navigate }"
              :to="item.to"
              custom
            >
              <NavigationMenuLink
                :active="isActive"
                :href="href"
                :class="navigationMenuTriggerStyle()"
                @click="navigate"
              >
                {{ item.title }}
              </NavigationMenuLink>
            </NuxtLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </main>
</template>

<script setup lang="ts">
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
</script>
