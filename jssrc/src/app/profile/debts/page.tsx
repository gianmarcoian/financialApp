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

  const [Debts, setDebts] = useState([] as any[]);


  // Debt list
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [showDebtEditModal, setShowDebtEditModal] = useState(false);
  const [showDebtDeleteModal, setShowDebtDeleteModal] = useState(false);

  const [editDebtNameValue, setEditDebtName] = useState("");
  const [editDebtTypeValue, setEditDebtType] = useState("");
  const [editDebtAmountValue, setEditDebtAmount] = useState("");
  const [editDebtCurValue, setEditDebtCurValue] = useState("");
  const [editDebtInterestRate, setEditDebtInterestRate] = useState("");

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [value, setValue] = useState('');
  const [expectedInterestRate, setInterestRate] = useState('');

  useEffect(() => {
    // Fetch the list of Debt sources when the component mounts

    getDebts().then(sources => {
      setDebts(sources ?? []);
    });
  }, []);

  return (
    <>
      <Card>
        <Card.Title className='mb-0'>
          <h2 className='m-4 mb-0'>Debts</h2>
        </Card.Title>
        <Card.Body>
          {getDebtList(Debts, selectedDebtId, setSelectedDebtId, showDebtEditModal, setShowDebtEditModal, showDebtDeleteModal, setShowDebtDeleteModal, editDebtNameValue, setEditDebtName, editDebtTypeValue, setEditDebtType, editDebtAmountValue, setEditDebtAmount, editDebtCurValue, setEditDebtCurValue, editDebtInterestRate, setEditDebtInterestRate)}
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          {getDebtForm(name, setName, type, setType, amount, setAmount, value, setValue, expectedInterestRate, setInterestRate)}
        </Card.Body>
      </Card>
    </>
  );
}

async function getDebts() {
  try {
    const resource = "/profile/debt";
    const response = await GET(resource);

    var Debts = [];
    if (response.ok) {
      const data = await response.json();

      Debts = Object.entries(data).map(([k, v]) => v) as any[];
    } else {
      // Handle errors
      console.error('Error fetching Debt sources');
    }
    return Debts;
  } catch (error) {
    console.error('An error occurred while sending the request:', error);
  }
}

type StringSetter = React.Dispatch<React.SetStateAction<string>>;


function getDebtForm(name: string, setName: StringSetter, type: string, setType: StringSetter, amount: string, setAmount: StringSetter, curValue: string, setCurValue: StringSetter, expectedInterestRate: string, setInterestRate: StringSetter) {
  const handleSubmit = async (e: any) => {
    e.preventDefault();


    const DebtData = {
      name: name,
      type: type,
      amount: amount,
      current_value: curValue,
      interest_rate: expectedInterestRate
    };

    try {
      const resource = "/profile/add_debt"; // Modify the resource endpoint accordingly
      const response = await POST(resource, DebtData);

      if (response.ok) {
        // Request was successful
        console.log('Debt added successfully');
        // You can perform further actions if needed
      } else {
        // Handle errors
        console.error('Error adding Debt');
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
        <Form.FloatingLabel label="Type" className='mr-2'>
          <Form.Control type="text" value={type} onChange={(e) => setType(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Amount" className='mr-2'>
          <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Current Value" className='mr-2'>
          <Form.Control type="number" value={curValue} onChange={(e) => setCurValue(e.target.value)} />
        </Form.FloatingLabel>
        <Form.FloatingLabel label="Expected Interest Rate (%)" className='mr-2'>
          <Form.Control type="number" value={expectedInterestRate} onChange={(e) => setInterestRate(e.target.value)} />
        </Form.FloatingLabel>
        <button className='ml-2 p-2 btn btn-sm btn-primary' type="submit">Add</button>
      </InputGroup>
    </Form>
  )

}


function getDebtList(Debts: any[], selectedId: string, setSelectedId: React.Dispatch<React.SetStateAction<string>>, showEditModal: boolean, setShowEditModal: React.Dispatch<React.SetStateAction<boolean>>, showDeleteModal: boolean, setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>, editName: string, setEditName: StringSetter, editType: string, setEditType: StringSetter, editAmount: string, setEditAmount: StringSetter, editCurValue: string, setEditCurValue: StringSetter, editInterestRate: string, setEditInterestRate: StringSetter) {
  return (
    <div className='mt-4'>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Debt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Name">
                <Form.Control type='input' placeholder='Name' defaultValue={editName} onChange={(e) => setEditName(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Type">
                <Form.Control className='mb-2' type='input' placeholder='Type' defaultValue={editType} onChange={(e) => setEditType(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Amount">
                <Form.Control type='number' placeholder='Amount' defaultValue={editAmount} onChange={(e) => setEditAmount(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Current Value">
                <Form.Control type='number' placeholder='Current Value' defaultValue={editCurValue} onChange={(e) => setEditCurValue(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>

            <Form.Group className='mb-2'>
              <Form.FloatingLabel label="Expected Interest Rate (%)">
                <Form.Control className='mb-2' type='number' placeholder='Expected Interest Rate' defaultValue={editInterestRate} onChange={(e) => setEditInterestRate(e.target.value)}></Form.Control>
              </Form.FloatingLabel>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShowEditModal(false);
            onEditDebt(selectedId, editName, editType, editAmount, editCurValue, editInterestRate);
          }}>Update</Button>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Debt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to remove the selected Debt?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => {
            setShowDeleteModal(false);
            onDeleteDebt(selectedId);
          }}>Yes</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>No</Button>
        </Modal.Footer>
      </Modal>



      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Current Value</th>
            <th>Expected Interest Rate (%)</th>
            <th className='col-2'></th>
          </tr>
        </thead>
        <tbody>
          {Debts.map((source, index) => (
            <tr key={index}>
              <td>{source.name}</td>
              <td>{source.type}</td>
              <td>{source.amount}</td>
              <td>{source.current_value}</td>
              <td>{source.interest_rate}</td>
              <td>
                <Button className='mr-2' variant='primary' onClick={() => {
                  setSelectedId(source.id);

                  setEditName(source.name);
                  setEditType(source.type);
                  setEditAmount(source.amount);
                  setEditCurValue(source.current_value);
                  setEditInterestRate(source.interest_rate);

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

function onEditDebt(id: string, name: string, type: string, amount: string, curValue: string, expectedInterestRate: string) {
  const resource = 'profile/edit_debt';
  const payload = {
    "id": id,
    "name": name,
    "type": type,
    "amount": amount,
    "current_value": curValue,
    "interest_rate": expectedInterestRate
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

function onDeleteDebt(id: string) {
  const resource = '/profile/delete_debt';
  const payload = {
    "id": id
  };

  POST(resource, payload).then(r => {
    if (r.ok) {
      window.location.reload();
    }
    else {
      console.error(r);
      alert("Failed to remove Debt, please try again or contact support.");
    }
  });
}