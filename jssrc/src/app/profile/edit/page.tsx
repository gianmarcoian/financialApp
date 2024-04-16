'use strict'
'use client'

import React, { useRef, useState } from 'react'
import { Credentials } from '@/components/credentials';
import { useRouter, useSearchParams } from 'next/navigation'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { POST, extractAuthFromHeader, addAuthQueryParams, extractAuthFromQuery, setAuthPassword } from '@/scripts/web';
import { Form, Modal, Button } from 'react-bootstrap';

export default function Home() {
  const router = useRouter();
  const [showPwModal, setShowPwModal] = useState(false);
  const passInput = useRef<HTMLInputElement>(null);
  const verifyBtn = useRef<HTMLButtonElement>(null);

  extractAuthFromQuery(useSearchParams());

  return (<>
    <Credentials flipButtonPriority={true} leftButtonText="Cancel" rightButtonText="Update" modalTitle="Edit Profile" registration={true} useModal={true} onModalLoginClicked={(n, p) => router.push("./" + addAuthQueryParams())} onModalRegisterClicked={(n, nv, e, ev, p, pv) => onUpdateClicked(n, nv, e, ev, p, pv, router, setShowPwModal, passInput, verifyBtn)} />
    <Modal show={showPwModal} onHide={() => setShowPwModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Please verify current password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Control type="password" placeholder="Enter your password" ref={passInput} />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPwModal(false)}>Close</Button>
        <Button id='verify-button' variant="primary" ref={verifyBtn}>Verify</Button>
      </Modal.Footer>
    </Modal >
  </>)
}

function onUpdateClicked(name: string, name_verify: string, email: string, email_verify: string, password: string, password_verify: string, router: AppRouterInstance, setShowModal: React.Dispatch<React.SetStateAction<boolean>>, modalPwField: React.RefObject<HTMLInputElement>, verifyButton: React.RefObject<HTMLButtonElement>) {
  const resource = "/profile/update";


  if (modalPwField.current != null) {
    modalPwField.current.innerHTML = "";
  }
  setShowModal(true);

  // Nasty hack to make sure the modal renders and the verifyButton
  setTimeout(() => {

    if (verifyButton.current == null) {
      console.warn("Verify button ref null.");
      return;
    }

    verifyButton.current.onclick = (e) => {
      var payload: any = {};
      if (name != "") {
        if (name == name_verify && isValidName(name)) {
          // Add the new name to the payload
          payload.username = name;
        }
        else {
          // Bad input.
          showError("User names must only contain letters and numbers and both entries must match.");
          return;
        }
      }

      if (email != "") {
        if (email == email_verify && isValidEmail(email)) {
          // Add the new email to the payload
          payload.email = email;
        }
        else {
          // Bad input.
          showError("Email must be a valid address and both entries must match.");
          return;
        }
      }

      if (password != "") {
        if (password == password_verify && isValidPassword(password)) {
          // Add the new password to the payload
          payload.password = password;
        }
        else {
          // Bad input.
          showError("Please enter a password that meets the following requirements:\nAt least 8 characters long\nContains at least one number\nContains at least one symbol\nBoth entries must match");
          return;
        }
      }

      setAuthPassword(modalPwField.current?.value ?? "");


      POST(resource, payload).then(async resp => {
        if (!resp.ok) {
          resp.json().then(data => {
            var msg = data?.error;
            if (msg === undefined || msg === null) {
              msg = "Unknown error prevented your profile from updating!";
            }
            showError(msg);
          }).catch(e => {
            console.error(e);
            showError("Unknown error prevented your profile from updating!");
          });
        }
        else {
          alert("Update successful!");
          extractAuthFromHeader(resp.headers);
          router.push("./" + addAuthQueryParams());
        }

        setShowModal(false);
      }).catch(e => {
        console.error(e);
        showError(e);

        setShowModal(false);
      });
    };
  }, 100)



}

function submitChanges(name: string, name_verify: string, email: string, email_verify: string, password: string, password_verify: string, router: AppRouterInstance, setShowModal: React.Dispatch<React.SetStateAction<boolean>>, modalPwField: React.RefObject<HTMLInputElement>) {
}

function showError(msg: string) {
  alert(msg);
}

function showSuccess(msg: string) {
  alert(msg);
}

function isValidName(n: string) {
  const regexCode = '^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$';
  const regex = new RegExp(regexCode);
  return regex.test(n);
}

function isValidEmail(n: string) {
  const regexCode = '^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$';
  const regex = new RegExp(regexCode);
  return regex.test(n);
}

function isValidPassword(p: string) {
  if (p.length < 8) {
    return false;
  }
  const symbols: Array<string> = [
    '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
    '-', '_', '=', '+', '[', ']', '{', '}', '\\', '|',
    ';', '\'', ':', '"', ',', '<', '.', '>', '/', '?',
    '`', '~'
  ];

  var containsNum = false;
  var containsSymbol = false;

  for (var i = 0; i < p.length; i++) {
    const c = p.charAt(i);
    if (c >= '0' && c <= '9') {
      containsNum = true;
    }

    if (symbols.includes(c)) {
      containsSymbol = true;
    }

    if (containsNum && containsSymbol) {
      break;
    }
  }

  return containsNum && containsSymbol;
}