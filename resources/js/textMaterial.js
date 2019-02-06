export const materials = {

    debug: false,

    store: {

        result: {},

        content: {
            first: {
                text1 : 'Connecting to a server...',
                text2 : 'Connected',
                text3 : 'You have 1 message from Administrator.',
                text4 : 'Preparing content...'
            },

            second: {
                text1 : 'Relax and stay tuned with me.'
            },

            third: {
                text1 : 'Let the force be with you!'
            }
        }

    },



    create(name){

        if(this.debug){
            console.log('Object Created: ' + name);
        }

        this.store.result[name] = {};

    },

    strSplit(text, key, name){

        if(this.debug){
            console.log('Splitting :' + key);
        }

        this.store.result[name][key] = [];

        Object.assign(this.store.result[name][key], text.split(''));

        if(this.debug){
            console.log('Splited and Displaying :' + ' Object->' + name + ', With Key : ' + key );
            console.log(this.store.result[name][key]);
        }

    },

    builder(name, textobj){

        this.create(name);

        for ( let [key, value] of Object.entries(this.store.content[textobj])) {

            this.strSplit(value, key, name);

        }

        return this.store.result[name]

    },

    ranTextToScram(name, textobj, item ) {

        let key = 'scrambTxt';

        let chars = "/!£$%^&*(_?|<>/!£$%^&*(_?|<>";
        let randStr = '';
        let array = this.store.content[textobj][item].length;

        for (let i = 0; i < array; i++) {

            let rnum = Math.floor(Math.random() * chars.length);

            randStr += chars.substring(rnum,rnum+1);
        }

        this.store.result[name][key] = [];

        Object.assign(this.store.result[name][key], randStr.split(''));

    },

    ScramObj(name, textobj, item){

        this.create(name);

        for ( let [key, value] of Object.entries(this.store.content[textobj])) {

            this.strSplit(value, key, name);

        }

        this.ranTextToScram(name, textobj, item);

        return this.store.result[name]

    }

};