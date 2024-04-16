'use strict'
'use client'

import Link from 'next/link'
import React from 'react'
import { Container } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

export default async function Home() {
  return (
    <Container>
      <Card>
        <Card.Body>
          <Card.Title>Welcome to Family Financial!</Card.Title>
          <Card.Text>
          </Card.Text>
          <Link href='/profile/login'><Button>Login</Button></Link>
          <Link className='ml-3' href='/profile/register'><Button variant='secondary'>Register</Button></Link>
        </Card.Body>
      </Card>
    </Container>
  )
}
