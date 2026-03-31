# PSD Signing Templates

Pre-built envelope patterns for common PSD document signing needs. Use these as starting points with `/documenso build`.

## Template 1: Employment Contract

**Recipients**: Employee (SIGNER, order 1) → HR Director (APPROVER, order 2) → Superintendent (SIGNER, order 3)
**Signing Order**: SEQUENTIAL
**Fields**:
- Page 1: Employee NAME (positionX=20, positionY=15, width=60, height=3)
- Last page: Employee SIGNATURE (positionX=5, positionY=80, width=40, height=5)
- Last page: Employee DATE (positionX=5, positionY=87, width=25, height=3)
- Last page: Superintendent SIGNATURE (positionX=55, positionY=80, width=40, height=5)
- Last page: Superintendent DATE (positionX=55, positionY=87, width=25, height=3)
- Each page: Employee INITIALS (positionX=85, positionY=95, width=10, height=3)

**Use case**: New hire employment agreements, contract renewals

## Template 2: Coaching Stipend Agreement

**Recipients**: Coach (SIGNER, order 1) → Athletic Director (APPROVER, order 2)
**Signing Order**: SEQUENTIAL
**Fields**:
- Page 1: Coach NAME (positionX=20, positionY=25, width=50, height=3)
- Page 1: Coach SIGNATURE (positionX=10, positionY=80, width=40, height=5)
- Page 1: Coach DATE (positionX=55, positionY=80, width=25, height=3)

**Use case**: Seasonal coaching agreements for sports programs

## Template 3: Substitute/Para Agreement

**Recipients**: Substitute (SIGNER) + HR (CC)
**Signing Order**: PARALLEL (only one signer)
**Fields**:
- Page 1: NAME (positionX=20, positionY=20, width=50, height=3)
- Page 1: SIGNATURE (positionX=10, positionY=80, width=40, height=5)
- Page 1: DATE (positionX=55, positionY=80, width=25, height=3)

**Use case**: Annual substitute teacher and paraeducator authorization forms

## Template 4: Vendor MOU

**Recipients**: Vendor Contact (SIGNER, order 1) → CIO/CFO (APPROVER, order 2) → Superintendent (SIGNER, order 3)
**Signing Order**: SEQUENTIAL
**Fields**:
- Page 1: Vendor Organization TEXT (positionX=20, positionY=15, width=60, height=3)
- Page 1: Vendor Contact NAME (positionX=20, positionY=22, width=60, height=3)
- Last page: Vendor SIGNATURE (positionX=5, positionY=75, width=40, height=5)
- Last page: Vendor DATE (positionX=5, positionY=82, width=25, height=3)
- Last page: Superintendent SIGNATURE (positionX=55, positionY=75, width=40, height=5)
- Last page: Superintendent DATE (positionX=55, positionY=82, width=25, height=3)

**Use case**: Memoranda of understanding with vendors, service providers

## Template 5: Board Policy Acknowledgement

**Recipients**: Board Member (SIGNER)
**Signing Order**: PARALLEL
**Fields**:
- Page 1: NAME (positionX=20, positionY=20, width=50, height=3)
- Last page: CHECKBOX "I have read and understand this policy" (positionX=5, positionY=75, width=3, height=2)
- Last page: SIGNATURE (positionX=10, positionY=82, width=40, height=5)
- Last page: DATE (positionX=55, positionY=82, width=25, height=3)

**Use case**: Annual board member policy acknowledgements, code of conduct

## Template 6: Field Trip Permission Slip

**Recipients**: Parent/Guardian (SIGNER) + Teacher (CC)
**Signing Order**: PARALLEL
**Fields**:
- Student NAME TEXT (positionX=20, positionY=15, width=50, height=3)
- CHECKBOX "I give permission for my child to attend" (positionX=5, positionY=55, width=3, height=2)
- CHECKBOX "I authorize emergency medical treatment" (positionX=5, positionY=60, width=3, height=2)
- CHECKBOX "I consent to photographs being taken" (positionX=5, positionY=65, width=3, height=2)
- Parent SIGNATURE (positionX=10, positionY=80, width=40, height=5)
- Parent DATE (positionX=55, positionY=80, width=25, height=3)

**Use case**: Field trip authorization with medical/photo consent

## Template 7: Media Release Form

**Recipients**: Parent/Guardian (SIGNER)
**Signing Order**: PARALLEL
**Fields**:
- Student NAME TEXT (positionX=20, positionY=15, width=50, height=3)
- CHECKBOX "I consent to photographs" (positionX=5, positionY=55, width=3, height=2)
- CHECKBOX "I consent to video recording" (positionX=5, positionY=60, width=3, height=2)
- Parent SIGNATURE (positionX=10, positionY=80, width=40, height=5)
- Parent DATE (positionX=55, positionY=80, width=25, height=3)

**Use case**: Student media permission for district communications

## Template 8: Facility Use Agreement

**Recipients**: Renter (SIGNER, order 1) → Facilities Director (APPROVER, order 2)
**Signing Order**: SEQUENTIAL
**Fields**:
- Organization TEXT (positionX=20, positionY=12, width=50, height=3)
- Event Description TEXT (positionX=20, positionY=18, width=50, height=3)
- Event Dates TEXT (positionX=20, positionY=24, width=50, height=3)
- Renter SIGNATURE (positionX=5, positionY=80, width=40, height=5)
- Renter DATE (positionX=5, positionY=87, width=25, height=3)
- Facilities Director SIGNATURE (positionX=55, positionY=80, width=40, height=5)
- Facilities Director DATE (positionX=55, positionY=87, width=25, height=3)

**Use case**: Community facility rental and use agreements

## Folder Organization

| Folder | Contents |
|--------|----------|
| HR | Employment contracts, stipend agreements, sub agreements |
| Board | Policy acknowledgements, board resolutions |
| Student Services | Permission slips, media releases, enrollment forms |
| Procurement | Vendor MOUs, grant agreements |
| Facilities | Use agreements, rental contracts |
| Compliance | Training acknowledgements, confidentiality agreements |
