<template>

    <!-- Text Editor 1 -->
    <div class="my-1 w-50 h-50">

        <div class="_card h-100">

            <header class="_card-header">
                <p class="_card-header-title">First Text</p>
            </header>

            <div class="_card-content">
                <div class="content">
                            <textarea class="_card-textarea" placeholder="e.g. Hello world" rows="10">

                            </textarea>
                </div>
            </div>

            <footer class="_card-footer flex-center">
                <button class="_card-button">Save</button>
            </footer>

        </div>

    </div>

</template>

<script>
    export default {
        name: "textEditor",
        data(){
            return{
                data:[],
            }
        },
    }
</script>

<style scoped>
    ._card{
        padding: 0.5rem;
        border: 2px dashed #86c60b;
        color: #86c60b;
        text-shadow: 0 0 5px rgba(134, 198, 11, 0.6);
    }

    ._card-textarea{
        width: 100%;
        height: 100%;
        border: 2px dashed #86c60b;
        background: none;
    }

    ._card-button {
        border: 1px dashed #86c60b;
        padding: 0.2rem;
        background: none;
        color: #86c60b;
        width: 50%;
    }
</style>