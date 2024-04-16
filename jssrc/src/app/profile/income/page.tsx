'use client'

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { POST, GET, extractAuthFromQuery } from '@/scripts/web'
import { useSearchParams } from 'next/navigation';
import { Container, Input } from 'postcss';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';


export default function Home() {

  extractAuthFromQuery(useSearchParams());

  const [incomeSources, setIncomeSources] = useState([] as any[]);


  // Income source list
  const [selectedIncomeSourceId, setSelectedIncomeSourceId] = useState("");
  const [showIncomeSourceEditModal, setShowIncomeSourceEditModal] = useState(false);
  const [showIncomeSourceDeleteModal, setShowIncomeSourceDeleteModal] = useState(false);

  const [editIncomeSourceNameValue, setEditIncomeSourceName] = useState("");
  const [editIncomeSourceAmountValue, setEditIncomeSourceAmount] = useState("");
  const [editIncomeSourceFrequencyValue, setEditIncomeSourceFrequency] = useState("");
  const [editIncomeSourceTypeValue, setEditIncomeSourceType] = useState("");

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('');

  useEffect(() => {
    // Fetch the list of income sources when the component mounts

    getIncomeSources().then(sources => {
      setIncomeSources(sources ?? []);
    });
  }, []);

  return (
    <>
      <Card>
        <Card.Title className='mb-0'>
          <h2 className='m-4 mb-0'>Income Sources</h2>
        </Card.Title>
        <Card.Body>
          {getIncomeList(incomeSources, selectedIncomeSourceId, setSelectedIncomeSourceId, showIncomeSourceEditModal, setShowIncomeSourceEditModal, showIncomeSourceDeleteModal, setShowIncomeSourceDeleteModal, editIncomeSourceNameValue, setEditIncomeSourceName, editIncomeSourceAmountValue, setEditIncomeSourceAmount, editIncomeSourceFrequencyValue, setEditIncomeSourceFrequency, editIncomeSourceTypeValue, setEditIncomeSourceType)}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          {getIncomeForm(name, setName, type, setType, amount, setAmount, frequency, setFrequency)}
        </Card.Body>
      </Card>
    </>
  );
}

async function getIncomeSources() {
  try {
    const resource = "/profile/income";
    const response = await GET(resource);

    var incomeSources = [];
    if (response.ok) {
      const data = await response.json();

      incomeSources = Object.entries(data).map(([k, v]) => v) as any[];
    } else {
      // Handle errors
      console.error('Error fetching income sources');
    }
    return incomeSources;
  } catch (error) {
    console.error('An error occurred while sending the request:', error);
  }
}

type StringSetter = React.Dispatch<React.SetStateAction<string>>;


function getIncomeForm(name: string, setName: StringSetter, type: string, setType: StringSetter, amount: string, setAmount: StringSetter, frequency: string, setFrequency: StringSetter) {
  const handleSubmit = async (e: any) => {
    e.preventDefault();


    const incomeData = {
      name: name,
      type: type,
      amount: amount,
      frequency: frequency
    };

    try {
      const resource = "/profile/add_income"; // Modify the resource endpoint accordingly
      const response = await POST(resource, incomeData);

      if (response.ok) {
        // Request was successful
        console.log('Income source added successfully');
        // You can perform further actions if needed
      } else {
        // Handle errors
        console.error('Error adding income source');
      }

      window.location.reload();
    } catch (error) {
      console.error('An error occurred while sending the request:', error);
    }
  };



  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Form.FloatingLabel label="Name" className='mr-2'>
          <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Amount" className='mr-2'>
          <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Frequency" className='mr-2'>
          <Form.Control type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Type" className='mr-2'>
          <Form.Control type="text" value={type} onChange={(e) => setType(e.target.value)} />
        </Form.FloatingLabel>
        <button className='ml-2 p-2 btn btn-sm btn-primary' type="submit">Add</button>
      </InputGroup>
    </Form>
  )

}


function getIncomeList(incomeSources: any[], selectedId: string, setSelectedId: React.Dispatch<React.SetStateAction<string>>, showEditModal: boolean, setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>, showDeleteModal: boolean, setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>, editName: string, setEditName: StringSetter, editAmount: string, setEditAmount: StringSetter, editFrequency: string, setEditFrequency: StringSetter, editType: string, setEditType: StringSetter) {
  return (
    <div className='mt-4'>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit income source</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Name">
                <Form.Control type='input' placeholder='Name' defaultValue={editName} onChange={(e) => setEditName(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Amount">
                <Form.Control type='number' placeholder='Amount' defaultValue={editAmount} onChange={(e) => setEditAmount(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Frequency">
                <Form.Control className='mb-2' type='input' placeholder='Frequency' defaultValue={editFrequency} onChange={(e) => setEditFrequency(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Type">
                <Form.Control className='mb-2' type='input' placeholder='Type' defaultValue={editType} onChange={(e) => setEditType(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShowEditModal(false);
            onEditIncomeSource(selectedId, editName, editType, editAmount, editFrequency);
          }}>Update</Button>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete income source</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to remove the selected income source?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShowDeleteModal(false);
            onDeleteIncomeSource(selectedId);
          }}>Yes</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>No</Button>
        </Modal.Footer>
      </Modal>



      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Frequency</th>
            <th>Type</th>
            <th className='col-2'></th>
          </tr>
        </thead>
        <tbody>
          {incomeSources.map((source, index) => (
            <tr key={index}>
              <td>{source.name}</td>
              <td>{source.amount}</td>
              <td>{source.frequency}</td>
              <td>{source.type}</td>
              <td>
                <Button className='mr-2' variant='primary' onClick={() => {
                  setSelectedId(source.id);

                  setEditName(source.name);
                  setEditType(source.type);
                  setEditAmount(source.amount);
                  setEditFrequency(source.frequency);

                  setShowEditModal(true);
                }}>Edit</Button>
                <Button variant='danger' onClick={() => {
                  setSelectedId(source.id);
                  setShowDeleteModal(true);
                }}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function onEditIncomeSource(id: string, name: string, type: string, amount: string, frequency: string) {
  const resource = 'profile/edit_income';
  const payload = {
    "id": id,
    "name": name,
    "amount": amount,
    "type": type,
    "frequency": frequency
  };

  POST(resource, payload).then(r => {
    if (r.ok) {
      window.location.reload();
    }
    else {
      console.error(r);
      alert("Failed to update, please try again or contact support.");
    }
  });
}

function onDeleteIncomeSource(id: string) {
  const resource = '/profile/delete_income';
  const payload = {
    "id": id
  };

  POST(resource, payload).then(r => {
    if (r.ok) {
      window.location.reload();
    }
    else {
      console.error(r);
      alert("Failed to remove income source, please try again or contact support.");
    }
  });
}