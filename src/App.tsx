import { Client, messageCallbackType } from '@stomp/stompjs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useApi } from './Api';
import './App.css';
import { ChatMessage } from './Message';

function App() {

  interface Input {
    targetId: string;
    draft: string;
  }

  const [userId, setUserId] = useState<string | undefined>(() => undefined);
  const [client, setClient] = useState<Client | undefined>(() => undefined);
  const [messages, setMessages] = useState<ChatMessage[]>(() => []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Input>({
    defaultValues: {
      targetId: '',
      draft: ''
    }
  })

  const { getUserId, getMessages, getMessage } = useApi()
  const { targetId, draft } = watch()

  const processTarget = async () => {
    var messages = await getMessages(targetId)
    console.log('fetched messages for target', targetId, messages)
    setMessages(m => messages)
  }

  useEffect(() => {
    const fetchUserId = async () => {
      console.log('Fetching user id')
      var id: string = await getUserId();
      setUserId(() => id)
    }

    fetchUserId();
  }, [])

  useEffect(() => {
    const subscribe = (client: Client | null, topic: string, callback: messageCallbackType) => {
      console.log('Subscribed to ', topic);
      client?.subscribe(topic, message => {
        console.log('Received message from websocket server', topic, message);
        callback(message)
      });
    }

    if (userId) {
      var url = 'ws://localhost:14000/chat'
      console.log(`Connecting to websocket server ${url} for user id ${userId}`)
      var c = new Client({ brokerURL: url });
      c.onConnect = () => {
        subscribe(c, `/topic/${userId}/messages`, message => setMessages(m => {
          var chat = JSON.parse(message.body)
          return [chat, ...m]
        }))
      }

      c.onDisconnect = () => console.log('Disconnected from server')

      setClient((old) => {
        old?.deactivate()
        return c;
      })

      c.activate();

    }

    return () => { client?.deactivate() }
  }, [userId])

  const processDraft = () => {
    if (draft) {
      var message = getMessage(draft)
      client?.publish({ destination: `/app/chat/${userId}`, body: JSON.stringify(message) })
      console.log('sent message', draft, JSON.stringify(message))
      reset({ draft: '' })
    }
  }

  return (
    <div className='flex flex-col h-screen p-4 gap-2'>
      <p className='flex-grow-0'>Your user id is {userId}</p>
      <div className='flex gap-2 flex-grow-0'>
        <input {...register("targetId")} className='text-input' />
        <button className='text-input-button' onClick={processTarget}>Start</button>
      </div>

      <div className='border-blue-200 border-2 focus:border-4 hover:border-blue-400 rounded-md flex-grow h-full flex flex-col-reverse'>
        <div className='flex flex-col-reverse flex-grow-0 overflow-y-scroll mx-4 my-2'>
          {messages.map(message => (
            message.from === userId ? 
            <div key={message.timestamp} className='py-2 self-end'>
              {(new Date(message.timestamp)).toString()} {message.message}
            </div>
            :
            <div key={message.timestamp} className='py-2'>
              {(new Date(message.timestamp)).toString()} {message.message}
            </div>
          ))}
        </div>
      </div>
      <div className='flex-grow-0 flex gap-2'>
        <input {...register("draft")} className='text-input flex-grow' />
        <button className='text-input-button' onClick={processDraft}>Send</button>
      </div>
    </div>
  );
}

export default App;
