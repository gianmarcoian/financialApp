'use strict'
'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { BACKEND } from '@/scripts/config';
import { GET, addAuthQueryParams, extractAuthFromQuery } from '@/scripts/web';
import { Container, Row, Spinner } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

export default function Home() {
  extractAuthFromQuery(useSearchParams());
  const resource = 'profile/'
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GET(resource).then(resp => {
      if (resp.ok) {
        return resp.json();
      }
      setUsername("Error retrieving user name");
      setEmail("Error retrieving user email");
      setFailed(true);
      setLoading(false);
      return Promise.resolve();
    }).then(data => {
      setUsername(data?.username ?? "Error retrieving user name");
      setEmail(data?.email ?? "Error retrieving user email");
      setLoading(false);
    }).catch(e => {
      console.log(e);
      setFailed(true);
      setLoading(false);
    });
  });



  return (<main>
    <Container style={{
      margin: '2em 10%', width: '80%'
    }}>
      <Card>
        <Card.Body>
          {loading &&
            <Spinner animation='border' variant='success'>
            </Spinner>
          }
          {!failed &&
            <Card.Title>{username}, here&apos;s your overview</Card.Title>
          }
          {!failed &&
            <Card.Text>
              Your email address is: {email} <br />
            </Card.Text>}
          {failed &&
            <Card.Title>Failed to retrieve profile information.</Card.Title>
          }
        </Card.Body>
      </Card>

      <Card className='mt-3'>
        <Card.Body>
          {loading &&
            <Spinner animation='border' variant='success'>
            </Spinner>
          }
          {!failed &&
            <Card.Title>Navigation</Card.Title>
          }
          {!failed &&
            <Card.Text className='float-right'>
              <Button onClick={() => router.push('./profile/edit' + addAuthQueryParams())}>Profile Settings</Button>
            </Card.Text>}
          {!failed &&
            <Row>
              <Card.Text>
                <Button className='mr-2' onClick={() => router.push('./profile/income' + addAuthQueryParams())}>Income</Button>
                <Button onClick={() => router.push('./profile/expenses' + addAuthQueryParams())}>Expenses</Button>
              </Card.Text>
            </Row>}
          {!failed &&
            <Row className='mt-2'>
              <Card.Text>
                <Button className='mr-2' onClick={() => router.push('./profile/assets' + addAuthQueryParams())}>Assets</Button>
                <Button onClick={() => router.push('./profile/debts' + addAuthQueryParams())}>Debts</Button>
              </Card.Text>
            </Row>}

          {failed &&
            <Card.Title>Failed to retrieve profile information.</Card.Title>
          }
        </Card.Body>
      </Card>
    </Container>
  </main>
  )
}
