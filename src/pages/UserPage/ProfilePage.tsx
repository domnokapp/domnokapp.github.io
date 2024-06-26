import '@xelene/tgui/dist/styles.css';
import '@mantine/core/styles/Input.css';
import type { FC } from 'react';
import { useState } from 'react';
import { rem } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { Input, List, Tappable } from '@xelene/tgui';

export const ProfilePage: FC = () => {
  const [name, setName] = useState('');

  return (
    <>
          <List style={{
      background: 'var(--tgui--secondary_bg_color)',
      padding: 0,
      margin: 0,
    }}>
        <Input header="Input" placeholder="I am usual input, just leave me alone" />
        <Input status="error" header="Input" placeholder="I am error input, don't make my mistakes..." />
        <Input status="focused" header="Input" placeholder="I am focused input, are u focused on me?" />
        <Input disabled header="Input" placeholder="I am disabled input" />

        <Input 
          header='គោត្តនាមនិងនាម'
          placeholder='បញ្ចូលឈ្មោះពេញរបស់អ្នក'
          value={name}
          onChange={e => setName(e.target.value)}
          after={<Tappable Component="div" style={{display: 'flex'}} onClick={() => setName('')}>
            <IconX style={{width: rem(15), height: rem(15)}} />
          </Tappable>} />
      </List>;
        
    </>
  );
};