import { NextPage } from 'next'

interface ErrorProps {
  statusCode?: number
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-orbitron font-bold mb-4">
        {statusCode ? `Error ${statusCode}` : 'An error occurred'}
      </h1>
      <p className="text-lg mb-8">Please try again later or contact support if the problem persists.</p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        Try again
      </button>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error