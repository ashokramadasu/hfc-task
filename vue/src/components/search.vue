<template>
  <div class='ui basic content center aligned segment'>
      <div class='content'>
        <div class='ui form'>
          <div class='field'>
            <label>Address </label>
            <input v-model="address" type='text' ref='title' defaultValue="">
          </div>
          <div class='ui two button attached buttons'>
            <button class='ui basic blue button' v-on:click="sendForm()">
              Search
            </button>
            <button class='ui basic red button' v-on:click="clearForm">
              Clear
            </button>
          </div>
        </div>
         <div class='content'>
             <label>Outlets </label>
            <input v-model="outlets" ref='outlets' defaultValue="">         
         </div>
      </div>
    </div>
</template>

<script>
   import axios from 'axios';
   const API_URL = 'http://localhost:3000/api';
export default {
  data() {
    return {
      address: '',
      outlets: '',
    };
  },
  methods: {
    clearForm() {
      this.outlets = '';
      this.address = '';
    },
    sendForm() {

      if (this.address.length) {
        //console.log(this.address)
        let address = this.address;
        axios.request(API_URL, {
            method: 'get',
            params: { address },
        },  { crossdomain: true })
        .then(response => {  
          //console.log(response.data)
          this.outlets = response.data;
        })
      }
      this.isCreating = false;
    },
  },
};
</script>