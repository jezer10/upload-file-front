<script>
import {
  PlusIcon,
  XMarkIcon,
  DocumentIcon,
  SwatchIcon,
} from "@heroicons/vue/24/solid";
import { client } from "./api/client";
import moment from "moment";
import "moment/dist/locale/es";
export default {
  components: { PlusIcon, XMarkIcon, DocumentIcon, SwatchIcon },

  data: () => ({
    posts: [],
    isLoading: false,
    isCreatingPostOpen: false,
    isAddFileModalOpen: false,
    isFileOpen: false,
    selectedPost: -1,
    selectedFile: "",
    uploadFile: {
      title: "",
      description: "",
      file: {},
    },
    post: {
      title: "",
      description: "",
      postFiles: [],
    },
  }),
  computed: {},
  created() {},
  mounted() {
    console.log(moment.locale("es"));

    this.getPosts();
  },
  methods: {
    closePreview() {
      this.isFileOpen = false;
      this.selectedPost = -1;
    },
    openFile(file) {
      this.selectedFile = `https://docs.google.com/gview?url=https://storage.googleapis.com/post-virtualizacion.appspot.com/${file}&embedded=true`;
      this.isFileOpen = true;
    },
    openSelectedPost(idx) {
      this.selectedPost = idx;
    },
    getDate(nns) {
      const parsedDate = moment(nns * 1000);
      const dateMonth = parsedDate.format("LLLL");
      return `${dateMonth}`;
    },
    addFileDescription() {
      const { title, description, file } = this.uploadFile;
      if (!title || !description || !file instanceof File) {
        return this.$toast.error("Faltan Datos Para Agregar Archivo");
      }
      this.post.postFiles.push(this.uploadFile);
      this.uploadFile = {};
      this.isAddFileModalOpen = false;
    },
    async savePost() {
      const { postFiles, description, title } = this.post;
      if (!title || !description || postFiles.length < 1) {
        return this.$toast.error("Datos Faltantes Para el Registro");
      }
      this.isLoading = true;
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      postFiles.forEach(({ title, description, file }, idx) => {
        formData.append(`${idx + 1}-content`, file);
        formData.append(`${idx + 1}-title`, title);
        formData.append(`${idx + 1}-description`, description);
      });
      const response = await client.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        this.isLoading = false;
        return this.$toast.error("Error en el registro");
      }
      this.post = {
        title: "",
        description: "",
        postFiles: [],
      };
      await this.getPosts();
      this.isLoading = false;
      this.isCreatingPostOpen = false;
      this.$toast.success("Registro correcto");
    },
    async getPosts() {
      const { data: posts } = await client.get("/posts");
      this.posts = posts;
    },
    selectFile(e) {
      this.uploadFile.file = e.files[0] ?? {};
    },
  },
};
</script>

<template>
  <div
    class="h-screen w-screen bg-black/50 flex items-center justify-center fixed inset-0"
    v-if="isLoading"
  >
    <SwatchIcon class="w-12 h-12 animate-spin text-indigo-600" />
  </div>
  <div
    v-if="isFileOpen"
    class="h-screen w-screen bg-black/60 fixed inset-0 flex items-center justify-center p-4 z-20"
  >
    <div
      class="bg-white p-6 rounded-lg w-3/4 h-full flex flex-col gap-4 relative"
    >
      <button
        class="w-4 h-4 absolute top-1 right-1"
        @click="isFileOpen = false"
      >
        <XMarkIcon />
      </button>
      <iframe :src="selectedFile" frameborder="0" class="h-full"></iframe>
    </div>
  </div>
  <div
    v-if="selectedPost > -1"
    class="h-screen w-screen bg-black/60 fixed inset-0 flex items-center justify-center px-4 z-10"
  >
    <div class="bg-white p-4 rounded-lg w-96 flex flex-col gap-2 relative">
      <button class="w-4 h-4 absolute top-1 right-1" @click="closePreview">
        <XMarkIcon />
      </button>
      <div class="font-bold text-2xl">
        {{ posts[selectedPost].title }}
      </div>
      <div class="text-sm">
        {{ posts[selectedPost].description }}
      </div>

      <div>
        <div
          class="flex flex-col w-full"
          v-for="(p, i) in posts[selectedPost].publications"
        >
          <button
            class="p-2 border-2 border-dotted w-full text-indigo-500 rounded-lg"
            @click="openFile(p.file)"
          >
            Abrir Archivo
          </button>
          <div class="flex flex-col text-xs">
            <span class="font-bold uppercase">{{
              `${i + 1}. ${p.title}`
            }}</span>
            <span class="">{{ p.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    class="h-screen w-screen bg-black/60 fixed inset-0 flex items-center justify-center px-4"
    v-if="isAddFileModalOpen"
  >
    <div class="bg-white p-4 rounded-lg w-96 flex flex-col gap-4">
      <div class="text-2xl font-bold text-gray-700">Agregar Archivo</div>
      <div class="grid gap-2">
        <input
          type="text"
          class="border-b-2 w-full border-indigo-500 focus:outline-none"
          placeholder="Titulo"
          v-model="uploadFile.title"
        />
        <textarea
          type="text"
          class="border-b-2 w-full border-indigo-500 focus:outline-none"
          placeholder="Descripción"
          v-model="uploadFile.description"
        ></textarea>
        <label
          for="upload-file"
          class="cursor-pointer rounded-lg text-center text-indigo-500 shadow-lg py-1 font-light"
          >{{ uploadFile.file?.name ?? "Seleccionar Archivo" }}</label
        >
        <input
          id="upload-file"
          type="file"
          hidden
          @change="selectFile($event.target)"
        />
        <div class="grid grid-cols-2">
          <button
            class="text-indigo-500 font-bold rounded-lg py-1"
            @click="isAddFileModalOpen = false"
          >
            Cancelar
          </button>
          <button
            @click="addFileDescription"
            class="bg-indigo-500 font-bold text-white rounded-lg py-1"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="w-screen h-screen overflow-y-auto bg-gray-100">
    <div class="h-full w-full">
      <div
        class="h-12 bg-indigo-600 text-white font-bold text-xl flex items-center px-4"
      >
        Actividades Ciclo Universitario - Informes Finales
      </div>

      <div class="w-full p-4" v-if="true">
        <div class="flex flex-col w-full gap-2" v-if="!isCreatingPostOpen">
          <span class="text-xl font-medium"
            >Publicaciones
            <span class="text-xs text-gray-500">
              {{
                posts.length < 1 ? "No hay posts creados, cree uno nuevo" : ""
              }}
            </span>
          </span>
          <div class="">
            <div class="grid grid-cols-3 gap-4 w-full">
              <button
                class="h-56 shadow rounded-lg relative"
                v-for="(p, i) in posts"
                @click="openSelectedPost(i)"
              >
                <div class="h-full pb-16">
                  <img
                    src="@/assets/images/blog-image.jpg"
                    class="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <div class="h-16 p-1 bg-white absolute bottom-0 inset-x-0">
                  <p class="flex flex-col">
                    <span class="font-medium w-full truncate">{{
                      p.title
                    }}</span>

                    <span class="text-xs font-light text-gray-600 w-full">{{
                      getDate(p.creationDate._seconds)
                    }}</span>
                  </p>
                </div>
              </button>

              <button
                @click="isCreatingPostOpen = true"
                class="border-2 border-dashed border-indigo-600 h-56 rounded-lg text-indigo-600 hover:text-white hover:bg-indigo-600"
              >
                <div class="w-full h-full flex items-center justify-center">
                  <PlusIcon class="w-8 h-8" />
                </div>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="grid gap-2">
          <input
            type="text"
            v-model="post.title"
            class="border-indigo-500 border-b-2 focus:outline-none pb-2 text-lg"
            placeholder="Titulo"
          />
          <textarea
            class="border-indigo-500 border-b-2 focus:outline-none pb-2 text-lg"
            v-model="post.description"
            placeholder="Descripción Principal"
          ></textarea>
          <div class="bg-gray-200 flex min-h-56" v-for="p in post.postFiles">
            <div class="w-1/3 p-4">
              <div
                class="border border-indigo-500 py-2 text-indigo-500 rounded-lg border-dashed h-full flex flex-col items-center justify-center"
              >
                <DocumentIcon class="w-8 h-8" />
                <span class="text-sm font-light w-full truncate text-center">
                  {{ p.file?.name }}</span
                >
              </div>
            </div>
            <div class="w-2/3 p-4">
              <p class="flex flex-col">
                <span class="font-bold text-lg">{{ p.title }}</span>
                <span>{{ p.description }}</span>
              </p>
            </div>
          </div>

          <button
            class="border-2 border-dashed border-indigo-600 h-12 rounded-lg text-indigo-600 hover:text-white hover:bg-indigo-600"
            @click="isAddFileModalOpen = true"
          >
            <div class="w-full h-full flex items-center justify-center">
              <PlusIcon class="w-8 h-8" />
            </div>
          </button>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="text-indigo-500 rounded-lg py-2"
              @click="isCreatingPostOpen = false"
            >
              Cancelar
            </button>
            <button
              class="bg-indigo-500 text-white rounded-lg py-2"
              @click="savePost"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
