<template>
	<v-container>
		<v-card>
			<v-btn @click="testmetod">Test yo</v-btn>
			<div>{{JSON.stringify(response)}}</div>
		</v-card>
	</v-container>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
	data: () => ({
		response: ''
	}),
	methods: {
		testmetod() {
			ipcRenderer.on('asynchronous-reply', (event, arg) => {
				this.response = arg
			})
			ipcRenderer.send('asynchronous-message', 'ping')
		}
	}
}
</script>
