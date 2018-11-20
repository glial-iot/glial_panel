export const get_time = {
    methods: {
        get_time: function (time) {

            let time_unix_now = Date.now() / 1000;
            let time_abs;
            if (
                this.$moment.unix(time_unix_now).format("Do MMMM") ===
                this.$moment.unix(time).format("Do MMMM")
            ) {
                time_abs = "Today, " + this.$moment.unix(time).format("HH:mm:ss");
            } else {
                time_abs = this.$moment.unix(time).format("Do MMMM, HH:mm:ss");
            }

            let time_diff = time - time_unix_now;
            let time_rel = this.$options.filters.toRelativeTime(time * 1000);
            if (time_diff < 2) {
                return time_abs.toString() + " (" + time_rel.toString() + ")";
            } else {
                return time_abs.toString();
            }
        }
    }
};