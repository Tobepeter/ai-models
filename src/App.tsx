import { useMount } from 'ahooks'
import { Outlet, useNavigate } from 'react-router-dom'

function App() {
	const navigate = useNavigate()

	useMount(() => {
		navigate('/test')
	})

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Outlet />
		</div>
	)
}

export default App
