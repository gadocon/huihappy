import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import MemberDetails from '../components/MemberDetails';
import AddMemberForm from '../components/AddMemberForm';
import { PlusCircle } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (membersError) {
        throw membersError;
      }

      setMembers(membersData || []);
      setMembersError(null);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembersError('Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setShowAddForm(false);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setShowAddForm(true);
  };

  const handleMemberAdded = () => {
    setShowAddForm(false);
    fetchMembers();
  };

  const filteredMembers = members ? members.filter(member => 
    member.name && member.name.toLowerCase().includes((selectedMember?.name || '').toLowerCase())
  ) : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <button
          onClick={handleAddMember}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          <span>Add Member</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : membersError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {membersError}
        </div>
      ) : (
        <div className="flex flex-1 gap-6">
          <div className="w-1/3 bg-white rounded-lg shadow p-4 h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search members..."
                className="w-full px-3 py-2 border rounded-md"
                onChange={(e) => {
                  const searchValue = e.target.value;
                  if (searchValue) {
                    const filtered = members.filter(member => 
                      member.name.toLowerCase().includes(searchValue.toLowerCase())
                    );
                    if (filtered.length > 0) {
                      setSelectedMember(filtered[0]);
                    }
                  }
                }}
              />
            </div>
            <ul className="space-y-2">
              {members.length === 0 ? (
                <li className="text-gray-500 text-center py-4">No members found</li>
              ) : (
                members.map((member) => (
                  <li
                    key={member.id}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedMember?.id === member.id
                        ? 'bg-blue-100 border-l-4 border-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleMemberSelect(member)}
                  >
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="w-2/3 bg-white rounded-lg shadow p-6">
            {showAddForm ? (
              <AddMemberForm onMemberAdded={handleMemberAdded} onCancel={() => setShowAddForm(false)} />
            ) : selectedMember ? (
              <MemberDetails member={selectedMember} onUpdate={fetchMembers} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p className="mb-4">Select a member to view details</p>
                <button
                  onClick={handleAddMember}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <PlusCircle size={18} />
                  <span>Add a new member</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
