<script setup lang="ts">
import { ref, onMounted } from 'vue';

let { errorCode, message: messageProps } = defineProps<{
   errorCode: number;
   message?: string;
}>();
const errorName = ref('');
const message = ref(messageProps);

const errorCodeDisplay = ref<HTMLElement | null>(null);
const containerElement = ref<HTMLElement | null>(null);

onMounted(() => {
   if (!containerElement.value) {
      console.error('Container element is not defined');
      return;
   }

   switch (errorCode) {
      case 400:
         errorName.value = 'BAD REQUEST';
         errorCodeDisplay.value.innerHTML = '<span class="stroke">4</span>00';
         message.value = messageProps || 'The request could not be understood by the server.';
         containerElement.value.style.setProperty('--codeColor', 'rgb(199, 56, 56)');
         document.title = '400 Bad Request';
         break;
      case 403:
         errorName.value = 'FORBIDDEN';
         errorCodeDisplay.value.innerHTML = '4<span class="stroke">0</span>3';
         message.value = messageProps || 'You do not have permission to access this resource.';
         containerElement.value.style.setProperty('--codeColor', 'rgb(199, 56, 56)');
         document.title = '403 Access Denied';
         break;
      case 404:
         errorName.value = 'NOT FOUND';
         errorCodeDisplay.value.innerHTML = '4<span class="stroke">0</span>4';
         message.value = messageProps || 'The page you are looking for does not exist.';
         containerElement.value.style.setProperty('--codeColor', 'rgb(199, 56, 56)');
         document.title = '404 Not Found';
         break;
      case 500:
         errorName.value = 'INTERNAL SERVER ERROR';
         errorCodeDisplay.value.innerHTML = '<span class="stroke">5</span>00';
         message.value = messageProps || 'An unexpected error occurred on the server.';
         containerElement.value.style.setProperty('--codeColor', '#efaf26');
         document.title = '500 Internal Server Error';
         break;
      default:
         errorName.value = 'UNKNOWN ERROR';
         message.value = messageProps || 'An unknown error occurred.';
   }
});

</script>

<template>
   <div ref="containerElement" class="container">
      <div class="title">
         <h1 ref="errorCodeDisplay"></h1>
         <h1 class="backStroke stroke">{{ errorCode }}</h1>
         <p>{{ errorName }}</p>
      </div>
      <p class="desc">{{ message }}</p>
      <a class="btnCont" href="/">
         <button class="homeBtn">Return to Home page</button>
      </a>
      <a class="askCat" :href="`https://http.cat/${errorCode}`">ask cat: what is {{ errorCode }}</a>
   </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

.container {
   --codeColor: rgb(199, 56, 56);

   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   width: 100%;

   @media (prefers-color-scheme:dark) {
      --background-color: rgb(30, 30, 30);
      --foreground-color: white
   }

   @media (prefers-color-scheme:light) {
      --background-color: white;
      --foreground-color: gray
   }
}

.desc {
   max-width: 60%;
   z-index: 10;
   text-wrap: pre-line;
   text-align: center;
}

.title {
   position: relative;
   margin: -7.7rem 0 -2.7rem -2.7rem;
   user-select: none;
   z-index: 1;
}

.title h1 {
   font-size: 40vw;
   font-weight: 800;
   font-style: italic;
   color: var(--codeColor);

   @media only screen and (min-width:1200px) {
      font-size: 30rem
   }

   & .stroke {
      color: transparent;
      -webkit-text-stroke-width: 4px;
      -webkit-text-stroke-color: var(--codeColor)
   }
}

.title h1.backStroke {
   position: fixed;
   margin: -2.7rem 0 -2.7rem -2.7rem;
   color: transparent;
   -webkit-text-stroke-width: 2.5px;
   -webkit-text-stroke-color: gray;
   z-index: -1
}

.title p {
   font-size: 7vw;
   position: absolute;
   right: -14.88%;
   top: 42%;
   transform: rotate(284.2deg);
   font-weight: 700;
   letter-spacing: -.8vw;
   color: var(--background-color);

   @media only screen and (min-width:1200px) {
      font-size: 5.2rem;
      right: -8.6rem;
      letter-spacing: -.6rem
   }
}

.btnCont {
   z-index: 10;
}

.homeBtn {
   width: 13rem;
   font-size: 16px;
   font-weight: 600;
   color: #fff;
   cursor: pointer;
   margin: 2.2rem 1rem 0.4rem 1rem;
   height: 55px;
   text-align: center;
   border: none;
   background-size: 300% 100%;
   border-radius: 50px;
   -o-transition: all .4s ease-in-out;
   -webkit-transition: all .4s ease-in-out;
   transition: all .4s ease-in-out;
   background-image: linear-gradient(60deg, #6253e1, #852d91, #a3a1ff, #f24645);
   box-shadow: 0 4px 15px 0 rgba(126, 52, 161, .75);
}

.homeBtn:hover {
   background-position: 100% 0;
   -moz-transition: all .4s ease-in-out;
   -o-transition: all .4s ease-in-out;
   -webkit-transition: all .4s ease-in-out;
   transition: all .4s ease-in-out
}

.homeBtn:focus {
   outline: none
}

.askCat {
   font-size: .8rem;
   text-decoration: none;
   z-index: 10;
}

.askCat:hover {
   text-decoration: underline;
}
</style>
