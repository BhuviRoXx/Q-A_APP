import React from 'react'
import { Tabs } from 'expo-router'

const _layout = () => {
  return (
    <Tabs>
        <Tabs.Screen name='home'/>
        <Tabs.Screen name='ask'/>
    </Tabs>
  )
}

export default _layout