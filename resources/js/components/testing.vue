<template>
    <div class="flex-block h-100 w-50 text-center">

        <p>{{ content }}</p>

        <div class="text-center task-item task-item-b">

            <p class="date">
                {{ clock }}
            </p>

            <p class="date">
                {{ date }}
            </p>

        </div>

    </div>
</template>

<script>
    export default {
        props: {
            content: {
                type: String,
                default: 'Please add content here'
            }
        },
        data(){
            return{
                clock:'',
                date:''
            }
        },
        mounted(){

            this.time(setInterval(this.time.bind(this), 1000));

        },
        methods:{

            time(){

                let cd =  new Date;

                this.date = ('0' + cd.getDate()).slice(-2) + '/'
                    + ( '0' + cd.getMonth()).slice(-2) + '/' + cd.getFullYear();

                this.clock = ('0' + cd.getHours()).slice(-2) + ' : ' + ('0' + cd.getMinutes()).slice(-2)
                    + ' : ' + ('0' + cd.getSeconds()).slice(-2);
            },

        }
    }
</script>