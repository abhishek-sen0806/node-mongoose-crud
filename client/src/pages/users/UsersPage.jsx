import { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Form, 
  InputGroup, 
  Row, 
  Col,
  Pagination,
  Dropdown,
  Image
} from 'react-bootstrap';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RotateCcw, 
  MoreVertical,
  Users,
  Filter,
  RefreshCw
} from 'lucide-react';
import userService from '../../services/user.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import UserModal from '../../components/users/UserModal';
import DeleteModal from '../../components/common/DeleteModal';
import toast from 'react-hot-toast';
import { PAGINATION } from '../../config/constants';

/**
 * Users Management Page
 */

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: PAGINATION.DEFAULT_LIMIT,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ role: '', sort: '-createdAt' });
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sort: filters.sort,
        ...(filters.role && { role: filters.role }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await userService.getAll(params);
      setUsers(response.data || []);
      
      if (response.meta?.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...response.meta.pagination,
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchUsers();
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleRestoreUser = async (user) => {
    try {
      await userService.restore(user._id);
      toast.success('User restored successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to restore user');
    }
  };

  const confirmDelete = async () => {
    try {
      await userService.delete(selectedUser._id);
      toast.success('User deactivated successfully');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleModalSuccess = () => {
    setShowUserModal(false);
    fetchUsers();
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'moderator': return 'warning';
      default: return 'info';
    }
  };

  const getAvatarUrl = (avatar) => {
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`;
    }
    return null;
  };

  const cardStyle = {
    background: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h1 className="text-white mb-1">
            <Users size={32} className="me-2" style={{ color: '#6366f1' }} />
            User Management
          </h1>
          <p className="text-muted mb-0">Manage all users in the system</p>
        </div>
        <Button 
          onClick={handleCreateUser}
          className="mt-3 mt-md-0"
          style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none'
          }}
        >
          <Plus size={18} className="me-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card style={cardStyle} className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <InputGroup.Text 
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#6366f1'
                    }}
                  >
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff'
                    }}
                  />
                  <Button type="submit" variant="outline-primary">
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#6366f1'
                  }}
                >
                  <Filter size={18} />
                </InputGroup.Text>
                <Form.Select
                  value={filters.role}
                  onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff'
                  }}
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ role: '', sort: '-createdAt' });
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
              >
                <RefreshCw size={18} className="me-2" />
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card style={cardStyle}>
        <Card.Body className="p-0">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0 table-dark" style={{ background: 'transparent' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th className="ps-4">User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              {getAvatarUrl(user.avatar) ? (
                                <Image 
                                  src={getAvatarUrl(user.avatar)} 
                                  roundedCircle 
                                  width={40} 
                                  height={40}
                                  className="me-3"
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <div 
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{ 
                                    width: 40, 
                                    height: 40, 
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="text-white">{user.name}</span>
                            </div>
                          </td>
                          <td className="text-muted">{user.email}</td>
                          <td>
                            <Badge bg={getRoleBadgeVariant(user.role)} className="text-uppercase">
                              {user.role}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={user.isActive ? 'success' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="text-muted">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-end pe-4">
                            <Dropdown align="end">
                              <Dropdown.Toggle 
                                variant="link" 
                                className="text-muted p-0"
                                style={{ boxShadow: 'none' }}
                              >
                                <MoreVertical size={18} />
                              </Dropdown.Toggle>
                              <Dropdown.Menu 
                                style={{ 
                                  background: 'rgba(26, 26, 46, 0.95)',
                                  border: '1px solid rgba(255,255,255,0.1)'
                                }}
                              >
                                <Dropdown.Item 
                                  onClick={() => handleEditUser(user)}
                                  className="text-white"
                                >
                                  <Edit size={16} className="me-2" />
                                  Edit
                                </Dropdown.Item>
                                {user.isActive ? (
                                  <Dropdown.Item 
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-danger"
                                  >
                                    <Trash2 size={16} className="me-2" />
                                    Deactivate
                                  </Dropdown.Item>
                                ) : (
                                  <Dropdown.Item 
                                    onClick={() => handleRestoreUser(user)}
                                    className="text-success"
                                  >
                                    <RotateCcw size={16} className="me-2" />
                                    Restore
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-4" 
                     style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <small className="text-muted">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} users
                  </small>
                  <Pagination className="mb-0">
                    <Pagination.Prev 
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    />
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={pagination.currentPage === i + 1}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modals */}
      <UserModal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        user={selectedUser}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${selectedUser?.name}? They will no longer be able to access the system.`}
      />
    </div>
  );
};

export default UsersPage;

