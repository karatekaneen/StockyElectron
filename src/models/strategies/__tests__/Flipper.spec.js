describe('Flipper Strategy', () => {
	describe('Context', () => {
		it.todo('Moves down lowest price on new low if bearish bias')
		it.todo('Moves up highest price on new high if bullish bias')
	})

	describe('Signaling', () => {
		it.todo('Generates entry signal if price has risen 1/5 from low and bearish bias')
		it.todo('Generates exit signal if price falls 1/6 from high and bullish bias')
	})

	describe('Regime filtering', () => {
		it.todo('Can take a separate dataset as regime filter')
		it.todo('Moves exit signal to 1/12 if bearish regime')
		it.todo('Does not enter if bearish regime')
	})
})
