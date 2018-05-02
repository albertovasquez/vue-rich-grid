export default {
    methods: {
        get: function (url) {
            return axios.get(url, {
                params: Object.assign({}, this.settings.baseParams, this.params),
            });
        },
    }
}