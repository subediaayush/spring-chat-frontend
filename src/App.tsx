import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import './App.css';
import { useApi } from './Api';

function App() {

  interface Input {
    targetId: string;
    draft: string;
  }

  const [userId, setUserId] = useState(() => undefined);
  const [messages, setMessages] = useState(() => []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Input>()

  const onSubmit: SubmitHandler<Input> = (data) => console.log(data)

  const [getUserId, setTarget, sendMessage] = useApi()

  useEffect(() => {
    const fetchUserId = async () => {
      setUserId(() => await getUserId())
    }

    fetchUserId();
  })

  // const sendTargetId = () => {
  //   console.log("target", watch())
  //   api
  // }

  // const sendMessage = () => {
  //   console.log("message", watch('draft'))
  // }

  return (
    <div className='flex flex-col h-screen p-4 gap-2'>
      <p className='flex-grow-0'>Your user id is {userId}</p>
      <div className='flex gap-2 flex-grow-0'>
        <input {...register("targetId")} className='text-input' />
        <button className='text-input-button' onClick={sendTargetId}>Start</button>
      </div>

      <div className='border-blue-200 border-2 focus:border-4 hover:border-blue-400 rounded-md flex-grow h-full'></div>
      <div className='flex-grow-0 flex gap-2'>
        <input {...register("draft")} className='text-input flex-grow' />
        <button className='text-input-button' onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
