<template>
   <div class="animated-background">
      <div class="bg-shape bg-shape-1"></div>
      <div class="bg-shape bg-shape-2"></div>
      <div class="bg-shape bg-shape-3"></div>
      <div class="bg-shape bg-shape-4"></div>
      <div class="bg-shape bg-shape-5"></div>
   </div>
</template>


<style scoped>
.animated-background {
   position: fixed;
   top: 0;
   left: 0;
   width: 100vw;
   height: 100vh;
   z-index: -10;
   overflow: hidden;
   background: linear-gradient(135deg,
         var(--color-background) 0%,
         color-mix(in srgb, var(--color-background) 95%, #e0e7ff 5%) 100%);
}

.bg-shape {
   position: absolute;
   border-radius: 50%;
   filter: blur(60px);
   opacity: 0.55;
   animation-duration: 25s;
   animation-iteration-count: infinite;
   animation-timing-function: linear;
}

.bg-shape-1 {
   width: 300px;
   height: 300px;
   background: radial-gradient(circle at 30% 30%,
         rgba(139, 92, 246, 0.4) 0%,
         rgba(59, 130, 246, 0.3) 35%,
         rgba(16, 185, 129, 0.2) 70%,
         transparent 100%);
   top: -150px;
   left: -150px;
   animation-name: float-1;
}

.bg-shape-2 {
   width: 400px;
   height: 400px;
   background: radial-gradient(ellipse at 70% 20%,
         rgba(236, 72, 153, 0.3) 0%,
         rgba(168, 85, 247, 0.25) 40%,
         rgba(59, 130, 246, 0.15) 80%,
         transparent 100%);
   top: 20%;
   right: -200px;
   animation-name: float-2;
   animation-duration: 30s;
}

.bg-shape-3 {
   width: 250px;
   height: 250px;
   background: conic-gradient(from 45deg at 50% 50%,
         rgba(34, 197, 94, 0.3) 0deg,
         rgba(59, 130, 246, 0.25) 120deg,
         rgba(168, 85, 247, 0.2) 240deg,
         rgba(34, 197, 94, 0.3) 360deg);
   bottom: 10%;
   left: 10%;
   animation-name: float-3;
   animation-duration: 35s;
}

.bg-shape-4 {
   width: 350px;
   height: 200px;
   background: linear-gradient(45deg,
         rgba(251, 191, 36, 0.25) 0%,
         rgba(249, 115, 22, 0.2) 30%,
         rgba(239, 68, 68, 0.15) 70%,
         transparent 100%);
   border-radius: 100px;
   top: 60%;
   right: 15%;
   animation-name: float-4;
   animation-duration: 28s;
   filter: blur(45px);
}

.bg-shape-5 {
   width: 180px;
   height: 180px;
   background: radial-gradient(circle at 60% 40%,
         rgba(99, 102, 241, 0.35) 0%,
         rgba(139, 92, 246, 0.25) 50%,
         transparent 100%);
   top: 40%;
   left: 50%;
   transform: translateX(-50%);
   animation-name: float-5;
   animation-duration: 32s;
}

@keyframes float-1 {

   0%,
   100% {
      transform: translate(0, 0) rotate(0deg);
   }

   25% {
      transform: translate(30px, -20px) rotate(90deg);
   }

   50% {
      transform: translate(-20px, 15px) rotate(180deg);
   }

   75% {
      transform: translate(15px, 25px) rotate(270deg);
   }
}

@keyframes float-2 {

   0%,
   100% {
      transform: translate(0, 0) scale(1);
   }

   33% {
      transform: translate(-25px, 20px) scale(1.05);
   }

   66% {
      transform: translate(20px, -15px) scale(0.95);
   }
}

@keyframes float-3 {

   0%,
   100% {
      transform: translate(0, 0) rotate(0deg) scale(1);
   }

   20% {
      transform: translate(15px, -25px) rotate(72deg) scale(1.1);
   }

   40% {
      transform: translate(-20px, -10px) rotate(144deg) scale(0.9);
   }

   60% {
      transform: translate(25px, 20px) rotate(216deg) scale(1.05);
   }

   80% {
      transform: translate(-15px, 15px) rotate(288deg) scale(0.95);
   }
}

@keyframes float-4 {

   0%,
   100% {
      transform: translateY(0) rotate(0deg);
   }

   50% {
      transform: translateY(-30px) rotate(180deg);
   }
}

@keyframes float-5 {

   0%,
   100% {
      transform: translateX(-50%) translateY(0) scale(1);
   }

   25% {
      transform: translateX(-50%) translateY(-15px) scale(1.08);
   }

   50% {
      transform: translateX(-50%) translateY(10px) scale(0.92);
   }

   75% {
      transform: translateX(-50%) translateY(-8px) scale(1.04);
   }
}


@media (prefers-color-scheme: dark) {
   .animated-background {
      background: linear-gradient(135deg,
            var(--color-background) 0%,
            color-mix(in srgb, var(--color-background) 92%, #1e1b4b 8%) 100%);
   }

   .bg-shape {
      opacity: 0.45;
      filter: blur(45px);
   }

   .bg-shape-1 {
      background: radial-gradient(circle at 30% 30%,
            rgba(139, 92, 246, 0.8) 0%,
            rgba(59, 130, 246, 0.6) 35%,
            rgba(16, 185, 129, 0.4) 70%,
            transparent 100%);
   }

   .bg-shape-2 {
      background: radial-gradient(ellipse at 70% 20%,
            rgba(236, 72, 153, 0.7) 0%,
            rgba(168, 85, 247, 0.6) 40%,
            rgba(59, 130, 246, 0.4) 80%,
            transparent 100%);
   }

   .bg-shape-3 {
      background: conic-gradient(from 45deg at 50% 50%,
            rgba(34, 197, 94, 0.7) 0deg,
            rgba(59, 130, 246, 0.6) 120deg,
            rgba(168, 85, 247, 0.5) 240deg,
            rgba(204, 255, 121, 0.7) 360deg);
   }

   .bg-shape-4 {
      background: linear-gradient(45deg,
            rgba(251, 191, 36, 0.6) 0%,
            rgba(249, 115, 22, 0.5) 30%,
            rgba(239, 68, 68, 0.4) 70%,
            transparent 100%);
      filter: blur(35px);
   }

   .bg-shape-5 {
      background: radial-gradient(circle at 60% 40%,
            rgba(99, 102, 241, 0.7) 0%,
            rgba(139, 92, 246, 0.5) 50%,
            transparent 100%);
   }
}
</style>
