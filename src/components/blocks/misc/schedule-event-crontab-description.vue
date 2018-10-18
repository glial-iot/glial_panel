<template>
    <v-card-text>
        <code class="cron-code font-weight-thin">
            * * * * * *
            │ │ │ │ │ └── Day of the Week
            │ │ │ │ │ (SUN-SAT or 0-6 or "*")
            │ │ │ │ └──── Month of the Year
            │ │ │ │ (JAN-DEC or 1-12 or "*")
            │ │ │ └────── Day of the Month
            │ │ │ (0-30 or "*")
            │ │ └──────── Hour (0-24 or "*")
            │ └────────── Minute (0-59 or "*")
            └──────────── Second (0-59)
        </code><br>
        <span>Schedule in a unix-like <a href="https://en.wikipedia.org/wiki/Cron"
                                         target="_blank">cron format</a> with seconds.</span>
    </v-card-text>
</template>