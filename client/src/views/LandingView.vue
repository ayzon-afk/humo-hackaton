<script setup>
import { project } from '@/config/project';
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <section class="hero min-h-[80vh]">
      <div class="hero-content text-center max-w-3xl flex-col gap-6">
        <div class="badge badge-outline">Humo Arena Hackathon · {{ project.team }}</div>
        <h1 class="text-5xl md:text-7xl font-black tracking-tight">{{ project.name }}</h1>
        <p class="text-xl opacity-80">{{ project.tagline }}</p>
        <div class="flex gap-3 justify-center">
          <RouterLink to="/login" class="btn btn-primary btn-lg">Открыть демо</RouterLink>
          <a href="#problem" class="btn btn-ghost btn-lg">Проблема ↓</a>
        </div>
      </div>
    </section>

    <section id="problem" class="max-w-4xl mx-auto px-6 py-16 text-center">
      <div class="text-7xl font-black text-primary">{{ project.problem.stat }}</div>
      <p class="text-xl mt-4 opacity-80">{{ project.problem.text }}</p>
    </section>

    <section class="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-4">
      <div v-for="f in project.features" :key="f.title" class="card bg-base-200">
        <div class="card-body">
          <div class="text-4xl">{{ f.icon }}</div>
          <h3 class="card-title">{{ f.title }}</h3>
          <p class="opacity-70">{{ f.text }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
